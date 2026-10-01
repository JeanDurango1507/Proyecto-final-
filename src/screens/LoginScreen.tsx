import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { loginUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      login(user);
      navigation.navigate('Home');
    } catch (error: any) {
      // Muestra la alerta con el mensaje específico (No registrado / Contraseña incorrecta)
      Alert.alert('Error de inicio de sesión', error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <CustomInput
        label="Correo Electrónico"
        placeholder="ejemplo@correo.com"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 25 },
});

export default LoginScreen;