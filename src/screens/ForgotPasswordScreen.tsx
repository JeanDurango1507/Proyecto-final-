import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    Alert.alert(
      'Reset Link Sent',
      'If an account exists with this email, you will receive instructions to reset your password.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer contraseña</Text>
      <Text style={styles.subtitle}>
        Ingrese su dirección de correo electrónico registrada para recibir 
        las instrucciones de recuperación de contraseña.
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
        title="Send Reset Link"
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