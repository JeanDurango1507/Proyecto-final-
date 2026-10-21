import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserRegisterForm } from '../types';
import { registerUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [formData, setFormData] = useState<UserRegisterForm>({
    firstName: '',
    lastName: '',
    documentId: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (key: keyof UserRegisterForm, value: string): void => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async (): Promise<void> => {
    if (Object.values(formData).some((value) => !value.trim())) {
      Alert.alert('Datos incompletos', 'Completa todos los campos.');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Contraseñas diferentes', 'Confirma que las contraseñas coincidan.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(formData);
      if (user) {
        login(user);
      } else {
        Alert.alert(
          'Confirma tu correo',
          'La cuenta se creó. Revisa tu correo y confirma la dirección antes de iniciar sesión.',
          [{ text: 'Ir a iniciar sesión', onPress: () => navigation.navigate('Login') }],
        );
      }
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo crear la cuenta',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={formData.firstName}
        onChangeText={(text) => handleChange('firstName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={formData.lastName}
        onChangeText={(text) => handleChange('lastName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Documento de Identidad"
        keyboardType="numeric"
        value={formData.documentId}
        onChangeText={(text) => handleChange('documentId', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de Teléfono"
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={(text) => handleChange('phoneNumber', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Registrarse'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default RegisterScreen;