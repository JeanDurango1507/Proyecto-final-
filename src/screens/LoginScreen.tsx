import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { loginUser, getCurrentUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      login(user);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error de inicio de sesión', error.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('Aviso', 'No hay huellas dactilares configuradas en este dispositivo.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Iniciar sesión con huella dactilar',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        const savedUser = await getCurrentUser();
        const sessionUser = savedUser || {
          id: '1',
          email: email || 'usuario@pascualbravo.edu.co',
          firstName: 'Jean',
          lastName: '',
        };

        login(sessionUser);
        navigation.navigate('Home');
      } else {
        Alert.alert('Cancelado', 'Autenticación biométrica no completada.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un problema con el sensor biométrico.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <CustomInput
        label="Correo Electrónico"
        placeholder="ejemplo@pascualbravo.edu.co"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <CustomButton
        title={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        onPress={handleLogin}
      />

      {isBiometricSupported && (
        <View style={styles.biometricContainer}>
          <CustomButton
            title="🔒 Ingresar con Huella Dactilar"
            onPress={handleBiometricLogin}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 25 },
  biometricContainer: { marginTop: 15 },
});

export default LoginScreen;