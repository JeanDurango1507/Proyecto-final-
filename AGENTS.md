# Expo / SincroFin

The app is pinned to Expo SDK 54 so a physical iPhone can open it with the Expo Go version available from the Apple App Store. Keep native dependencies aligned with SDK 54 using `npx expo install --fix`.

The main mobile app calls Supabase directly using the public anon/publishable key. Never commit `.env`, service-role keys, passwords, or access tokens. Keep row-level security (RLS) enabled and use authenticated policies for every private table.

When changing Expo APIs, consult the versioned SDK 54 documentation: https://docs.expo.dev/versions/v54.0.0/ . The existing QR invoice scanner uses `expo-camera` and must be exercised on a physical iOS and Android device.
