import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '../utils/formatCurrency';

const TRANSACTIONS_KEY = '@app_transactions_list';

export default function AddTransactionScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      try {
        const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        const list = stored ? JSON.parse(stored) : [];
        const balance = list.reduce((acc: number, item: any) => {
          const val = Math.abs(item.amount);
          return item.type === 'income' ? acc + val : acc - val;
        }, 0);
        setCurrentBalance(Math.max(0, balance));
      } catch (e) {
        setCurrentBalance(0);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setIsScanning(false);
    try {
      const parsed = JSON.parse(data);
      if (parsed.name || parsed.title) setTitle(parsed.name || parsed.title);
      if (parsed.amount) setAmount(String(Math.abs(parsed.amount)));
      setType('expense');
      Alert.alert('Éxito', 'Factura escaneada correctamente por QR.');
    } catch {
      setTitle(`Factura QR: ${data.substring(0, 25)}`);
      setType('expense');
      Alert.alert('QR Detectado', 'Ingresa el monto de la factura leída.');
    }
  };

  const handleSave = async () => {
    const cleanAmount = Number(amount.replace(/\./g, '').replace(/,/g, ''));

    if (!title.trim() || isNaN(cleanAmount) || cleanAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa una descripción y un monto válido.');
      return;
    }

    if (type === 'expense' && cleanAmount > currentBalance) {
      Alert.alert(
        'Saldo Insuficiente',
        `No puedes gastar más de tu saldo disponible ($${formatCurrency(currentBalance)}).`
      );
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      const list = stored ? JSON.parse(stored) : [];

      const newTx = {
        id: Date.now().toString(),
        title: title.trim(),
        amount: cleanAmount,
        type,
        date: new Date().toISOString().split('T')[0],
      };

      const updatedList = [newTx, ...list];
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedList));

      const newBalance = updatedList.reduce((acc: number, item: any) => {
        const val = Math.abs(item.amount);
        return item.type === 'income' ? acc + val : acc - val;
      }, 0);

      Alert.alert(
        'Registrado',
        `Movimiento guardado con éxito.\nNuevo saldo: $${formatCurrency(newBalance)}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el movimiento.');
    }
  };

  if (isScanning) {
    return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerInstruction}>Enfoca el código QR de la factura</Text>
          <TouchableOpacity style={styles.cancelScanButton} onPress={() => setIsScanning(false)}>
            <Text style={styles.cancelScanText}>Cancelar Escaneo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Movimiento</Text>
        <Text style={styles.balanceBadge}>Disponible: ${formatCurrency(currentBalance)}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.incomeActive]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>+ Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.expenseActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>- Gasto</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => {
            setScanned(false);
            setIsScanning(true);
          }}
        >
          <Text style={styles.qrButtonText}>📷 Escanear Factura con QR</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Salario, Supermercado..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 50000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  balanceBadge: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
  },
  formContainer: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  incomeActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  expenseActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeText: {
    fontWeight: 'bold',
    color: '#475569',
  },
  typeTextActive: {
    color: '#fff',
  },
  qrButton: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  label: {
    color: '#334155',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 40,
    alignItems: 'center',
  },
  scannerInstruction: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 8,
    marginTop: 40,
  },
  cancelScanButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 30,
  },
  cancelScanText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});