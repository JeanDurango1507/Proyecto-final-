import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { requestPasswordReset } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      Alert.alert(
        'Revisa tu correo',
        'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.',
        [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo enviar el correo',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered email address to receive password recovery instructions.
      </Text>

      <CustomInput
        label="Email Address"
        placeholder="example@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <CustomButton
        title={loading ? 'Enviando...' : 'Enviar enlace'}
        onPress={handleResetPassword}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
});

export default ForgotPasswordScreen;