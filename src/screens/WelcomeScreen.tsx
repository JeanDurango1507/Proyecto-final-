import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Gastos</Text>
      <Text style={styles.subtitle}>Gestiona tus finanzas personales y familiares fácilmente</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.secondaryButtonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, textAlign: 'center' },
  button: { width: '100%', padding: 15, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#007AFF' },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#007AFF', marginTop: 15, fontSize: 14 },
});

export default WelcomeScreen;