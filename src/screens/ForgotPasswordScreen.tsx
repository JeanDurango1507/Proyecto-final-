import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { requestPasswordReset } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert('Correo no válido', 'Escribe una dirección de correo válida.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(normalizedEmail);
      Alert.alert(
        'Solicitud enviada',
        'Si la cuenta existe, recibirás las instrucciones de recuperación en tu correo.',
        [{ text: 'Volver', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo enviar el correo',
        error instanceof Error ? error.message : 'Inténtalo nuevamente más tarde.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Te enviaremos instrucciones al correo registrado.</Text>
      <CustomInput
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      {loading ? <ActivityIndicator color="#007AFF" style={styles.loading} /> : null}
      <CustomButton
        title={loading ? 'Enviando...' : 'Enviar instrucciones'}
        onPress={() => { void handleResetPassword(); }}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  loading: { marginTop: 8 },
});

export default ForgotPasswordScreen;
