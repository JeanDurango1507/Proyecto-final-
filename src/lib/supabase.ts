import 'react-native-url-polyfill/auto';

import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.');
}

try {
  const parsedUrl = new URL(supabaseUrl);
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new Error('invalid URL');
  }
} catch {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL debe ser una URL HTTPS válida de Supabase.');
}

const chunkMarker = '__SINCROFIN_SECURE_CHUNKS__:';
const secureChunkLimit = 1800;

type ChunkReference = { version: string; count: number };

const parseChunkReference = (value: string | null): ChunkReference | null => {
  if (!value?.startsWith(chunkMarker)) return null;
  const [version, countText] = value.slice(chunkMarker.length).split(':');
  const count = Number(countText);
  return version && Number.isInteger(count) && count > 0 ? { version, count } : null;
};

const splitUtf8Chunks = (value: string): string[] => {
  const chunks: string[] = [];
  let chunk = '';
  let byteCount = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    const bytes = codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    if (byteCount + bytes > secureChunkLimit && chunk) {
      chunks.push(chunk);
      chunk = '';
      byteCount = 0;
    }
    chunk += character;
    byteCount += bytes;
  }

  if (chunk) chunks.push(chunk);
  return chunks;
};

const chunkKey = (key: string, version: string, index: number): string =>
  `${key}.chunk.${version}.${index}`;

const secureStorage: SupportedStorage = {
  async getItem(key) {
    const storedValue = await SecureStore.getItemAsync(key);
    const reference = parseChunkReference(storedValue);
    if (!reference) return storedValue;

    const parts = await Promise.all(
      Array.from({ length: reference.count }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, reference.version, index)),
      ),
    );
    if (parts.some((part) => part === null)) {
      throw new Error('La sesión segura de Supabase está incompleta. Cierra sesión y vuelve a ingresar.');
    }
    return parts.join('');
  },

  async setItem(key, value) {
    const previousReference = parseChunkReference(await SecureStore.getItemAsync(key));
    const version = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const chunks = splitUtf8Chunks(value);
    const newKeys = chunks.map((_, index) => chunkKey(key, version, index));

    try {
      for (let index = 0; index < chunks.length; index += 1) {
        await SecureStore.setItemAsync(newKeys[index], chunks[index], {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
      await SecureStore.setItemAsync(key, `${chunkMarker}${version}:${chunks.length}`, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error: unknown) {
      await Promise.all(newKeys.map((itemKey) => SecureStore.deleteItemAsync(itemKey).catch(() => {})));
      throw error;
    }

    if (previousReference) {
      await Promise.all(
        Array.from({ length: previousReference.count }, (_, index) =>
          SecureStore.deleteItemAsync(chunkKey(key, previousReference.version, index)),
        ),
      );
    }
  },

  async removeItem(key) {
    const reference = parseChunkReference(await SecureStore.getItemAsync(key));
    await SecureStore.deleteItemAsync(key);
    if (reference) {
      await Promise.all(
        Array.from({ length: reference.count }, (_, index) =>
          SecureStore.deleteItemAsync(chunkKey(key, reference.version, index)),
        ),
      );
    }
  },
};

const browserStorage: SupportedStorage = {
  async getItem(key) {
    return globalThis.localStorage.getItem(key);
  },
  async setItem(key, value) {
    globalThis.localStorage.setItem(key, value);
  },
  async removeItem(key) {
    globalThis.localStorage.removeItem(key);
  },
};

const projectReference = new URL(supabaseUrl).hostname.split('.')[0];

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: Platform.OS === 'web' ? browserStorage : secureStorage,
    storageKey: `sb-${projectReference}-auth-token`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
