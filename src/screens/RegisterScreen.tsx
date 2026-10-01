import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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

  const handleChange = (key: keyof UserRegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Campos Incompletos', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña Débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error de Contraseña', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerUser(formData);
      login(newUser);
      Alert.alert('¡Registro Exitoso!', 'Bienvenido a la aplicación.', [
        { text: 'Continuar', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error: any) {
      Alert.alert('Error de Registro', error.message || 'Ocurrió un problema al registrar la cuenta.');
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
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: '#FFF' },
  button: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default RegisterScreen;