import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, UserRegisterForm } from '../types';
import { registerUser } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserRegisterForm>({
    firstName: '',
    lastName: '',
    documentId: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { login } = useAuth();

  const handleChange = (key: keyof UserRegisterForm, value: string): void => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleRegister = async (): Promise<void> => {
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (Object.values(formData).some((value) => !value.trim())) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para crear la cuenta.');
      return;
    }
    if (!/^[^\s@]+@pascualbravo\.edu\.co$/.test(normalizedEmail)) {
      Alert.alert('Correo no válido', 'Usa tu correo institucional @pascualbravo.edu.co.');
      return;
    }
    if (formData.password.length < 8) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Contraseñas diferentes', 'Confirma que ambas contraseñas coincidan.');
      return;
    }
    if (!/^\d{6,15}$/.test(formData.documentId.trim())) {
      Alert.alert('Documento no válido', 'Escribe un documento de 6 a 15 dígitos.');
      return;
    }
    if (!/^[+\d][\d\s()-]{6,19}$/.test(formData.phoneNumber.trim())) {
      Alert.alert('Teléfono no válido', 'Revisa el número de teléfono.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser({
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        documentId: formData.documentId.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: normalizedEmail,
      });

      if (user) {
        login(user);
        return;
      }

      Alert.alert(
        'Confirma tu correo',
        'La cuenta se creó. Confirma el mensaje enviado a tu correo y después inicia sesión.',
        [{ text: 'Ir a iniciar sesión', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo crear la cuenta',
        error instanceof Error ? error.message : 'Verifica tus datos e inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Usa tu correo institucional para guardar tus datos.</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={formData.firstName} onChangeText={(text) => handleChange('firstName', text)} maxLength={80} />
      <TextInput style={styles.input} placeholder="Apellido" value={formData.lastName} onChangeText={(text) => handleChange('lastName', text)} maxLength={80} />
      <TextInput style={styles.input} placeholder="Documento de identidad" keyboardType="number-pad" value={formData.documentId} onChangeText={(text) => handleChange('documentId', text)} maxLength={15} />
      <TextInput style={styles.input} placeholder="Número de teléfono" keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(text) => handleChange('phoneNumber', text)} maxLength={20} />
      <TextInput
        style={styles.input}
        placeholder="Correo institucional"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        maxLength={254}
      />
      <TextInput style={styles.input} placeholder="Contraseña (mínimo 8 caracteres)" secureTextEntry value={formData.password} onChangeText={(text) => handleChange('password', text)} maxLength={128} />
      <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry value={formData.confirmPassword} onChangeText={(text) => handleChange('confirmPassword', text)} maxLength={128} />

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={() => { void handleRegister(); }} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Registrarse</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default RegisterScreen;
