import { Platform } from 'react-native';

// Expo Go on iOS cannot use Face ID; native iOS builds can.
export const canUseLocalBiometrics = (): boolean =>
  Platform.OS === 'android' || (Platform.OS === 'ios' && !__DEV__);
