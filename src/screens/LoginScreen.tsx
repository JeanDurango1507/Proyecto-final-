import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { loginUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { canUseLocalBiometrics } from '../utils/deviceBiometrics';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { enableBiometricUnlock, login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Datos incompletos', 'Escribe tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(normalizedEmail, password);
      login(user);
      if (
        canUseLocalBiometrics() &&
        await LocalAuthentication.hasHardwareAsync() &&
        await LocalAuthentication.isEnrolledAsync()
      ) {
        Alert.alert(
          'Activar huella',
          'Puedes pedir una confirmación biométrica cuando vuelvas a abrir SincroFin en este dispositivo.',
          [
            { text: 'Ahora no', style: 'cancel' },
            {
              text: 'Activar',
              onPress: () => {
                void enableBiometricUnlock().then((enabled) => {
                  if (enabled) Alert.alert('Huella activada', 'La sesión seguirá protegida con tu autenticación de Supabase.');
                }).catch(() => {
                  Alert.alert('No se pudo activar la huella', 'Puedes continuar con tu sesión normal.');
                });
              },
            },
          ],
        );
      }
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo iniciar sesión',
        error instanceof Error ? error.message : 'Verifica tus datos e inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <CustomInput
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <CustomInput
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? <ActivityIndicator color="#007AFF" style={styles.loading} /> : null}
      <CustomButton
        title={loading ? 'Validando...' : 'Iniciar sesión'}
        onPress={() => { void handleLogin(); }}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 25 },
  loading: { marginTop: 8 },
});

export default LoginScreen;
