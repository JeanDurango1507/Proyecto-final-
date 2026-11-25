import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { toAppUser } from '../services/authService';
import { supabase } from '../lib/supabase';
import { canUseLocalBiometrics } from '../utils/deviceBiometrics';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricLocked: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  enableBiometricUnlock: () => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
}

const biometricUnlockKey = 'sincrofin-biometric-unlock';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isBiometricLocked: false,
  login: () => {},
  logout: async () => {},
  enableBiometricUnlock: async () => false,
  unlockWithBiometrics: async () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const biometricLockedRef = React.useRef(false);

  useEffect(() => {
    let mounted = true;
    const applySession = (_event: AuthChangeEvent, session: Session | null): void => {
      void (async () => {
        let shouldLock = biometricLockedRef.current;
        if (_event === 'INITIAL_SESSION') {
          shouldLock = false;
          if (session?.user && canUseLocalBiometrics()) {
            try {
              shouldLock = (await SecureStore.getItemAsync(biometricUnlockKey)) === 'enabled';
            } catch (error: unknown) {
              console.warn('No se pudo revisar el bloqueo biométrico:', error);
            }
          }
        } else if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          shouldLock = false;
        }

        if (!mounted) return;
        biometricLockedRef.current = shouldLock;
        setIsBiometricLocked(shouldLock);
        setUser(session?.user && !shouldLock ? toAppUser(session.user) : null);
        setIsLoading(false);
      })();
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(applySession);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User): void => {
    biometricLockedRef.current = false;
    setIsBiometricLocked(false);
    setUser(userData);
  };

  const enableBiometricUnlock = async (): Promise<boolean> => {
    if (!canUseLocalBiometrics() || !user) return false;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirma la biometría para desbloquear SincroFin',
      fallbackLabel: 'Cancelar',
      cancelLabel: 'Cancelar',
    });
    if (!result.success) return false;

    await SecureStore.setItemAsync(biometricUnlockKey, 'enabled', {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (!canUseLocalBiometrics()) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquea SincroFin',
      fallbackLabel: 'Cancelar',
      cancelLabel: 'Cancelar',
    });
    if (!result.success) return false;

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      biometricLockedRef.current = false;
      setIsBiometricLocked(false);
      setUser(null);
      return false;
    }

    biometricLockedRef.current = false;
    setIsBiometricLocked(false);
    setUser(toAppUser(data.session.user));
    return true;
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isBiometricLocked,
      login,
      logout,
      enableBiometricUnlock,
      unlockWithBiometrics,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
