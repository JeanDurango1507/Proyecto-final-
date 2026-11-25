import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

const AppLockScreen: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const { logout, unlockWithBiometrics } = useAuth();

  const unlock = async (): Promise<void> => {
    setBusy(true);
    try {
      const unlocked = await unlockWithBiometrics();
      if (!unlocked) Alert.alert('No se pudo desbloquear', 'Usa tu contraseña para iniciar sesión de nuevo.');
    } catch {
      Alert.alert('No se pudo desbloquear', 'Inténtalo nuevamente o inicia sesión con tu contraseña.');
    } finally {
      setBusy(false);
    }
  };

  const usePassword = async (): Promise<void> => {
    setBusy(true);
    try {
      await logout();
    } catch {
      Alert.alert('No se pudo cerrar la sesión', 'Revisa tu conexión e inténtalo otra vez.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>SincroFin está bloqueado</Text>
      <Text style={styles.subtitle}>Confirma tu huella o rostro para volver a la sesión guardada de forma segura.</Text>
      {busy ? <ActivityIndicator color="#FFF" style={styles.loading} /> : null}
      <TouchableOpacity style={[styles.button, busy && styles.disabled]} onPress={() => { void unlock(); }} disabled={busy}>
        <Text style={styles.buttonText}>Desbloquear con biometría</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.passwordButton} onPress={() => { void usePassword(); }} disabled={busy}>
        <Text style={styles.passwordText}>Usar contraseña</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center', backgroundColor: '#0F172A' },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#CBD5E1', textAlign: 'center', lineHeight: 22, marginTop: 12, marginBottom: 24 },
  loading: { marginBottom: 12 },
  button: { backgroundColor: '#0F766E', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  passwordButton: { padding: 15, marginTop: 6 },
  passwordText: { color: '#CBD5E1' },
  disabled: { opacity: 0.6 },
});

export default AppLockScreen;
