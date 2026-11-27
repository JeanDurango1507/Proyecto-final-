import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { Category, Family, RootStackParamList, TransactionKind, TransactionScope } from '../types';
import { listFamilies } from '../services/familyService';
import { listCategories, saveTransaction } from '../services/transactionService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const readText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 160) : undefined;

const readAmount = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return String(value);
  if (typeof value !== 'string') return undefined;

  const numeric = value.trim().replace(/[^\d,.-]/g, '');
  if (!numeric || !/\d/.test(numeric)) return undefined;
  const lastComma = numeric.lastIndexOf(',');
  const lastDot = numeric.lastIndexOf('.');
  let normalized = numeric;

  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const groupingSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = numeric.split(groupingSeparator).join('');
    if (decimalSeparator === ',') normalized = normalized.replace(',', '.');
  } else if (lastComma >= 0) {
    const decimals = numeric.length - lastComma - 1;
    normalized = decimals > 0 && decimals <= 2
      ? numeric.slice(0, lastComma).replace(/,/g, '') + `.${numeric.slice(lastComma + 1)}`
      : numeric.replace(/,/g, '');
  } else if (lastDot >= 0 && numeric.indexOf('.') !== lastDot) {
    const decimals = numeric.length - lastDot - 1;
    normalized = decimals > 0 && decimals <= 2
      ? numeric.slice(0, lastDot).replace(/\./g, '') + `.${numeric.slice(lastDot + 1)}`
      : numeric.replace(/\./g, '');
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? String(amount) : undefined;
};

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const scannedRef = useRef(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [scope, setScope] = useState<TransactionScope>('personal');
  const [categories, setCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyId, setFamilyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadingFamilies(true);

      void listFamilies()
        .then((result) => {
          if (!active) return;
          setFamilies(result);
          setFamilyId((current) => result.some((family) => family.id === current) ? current : result[0]?.id ?? '');
        })
        .catch((error: unknown) => {
          if (active) {
            Alert.alert('No se pudieron cargar los grupos familiares', error instanceof Error ? error.message : 'Verifica tu conexión con Supabase.');
          }
        })
        .finally(() => { if (active) setLoadingFamilies(false); });

      return () => { active = false; };
    }, []),
  );

  useFocusEffect(
    useCallback(() => () => {
      scannedRef.current = true;
      setIsScanning(false);
    }, []),
  );

  useEffect(() => {
    let active = true;
    setLoadingCategories(true);
    setCategoryId('');

    void listCategories(kind)
      .then((result) => {
        if (!active) return;
        setCategories(result);
        setCategoryId(result[0]?.id ?? '');
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert('No se pudieron cargar las categorías', error instanceof Error ? error.message : 'Verifica tu conexión con Supabase.');
        }
      })
      .finally(() => { if (active) setLoadingCategories(false); });

    return () => { active = false; };
  }, [kind]);

  const handleBarcodeScanned = (result: BarcodeScanningResult): void => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setIsScanning(false);

    const qrContent = result.data.trim().slice(0, 2000);
    try {
      const parsed: unknown = JSON.parse(qrContent);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const data = parsed as Record<string, unknown>;
        const invoice = data.invoice && typeof data.invoice === 'object'
          ? data.invoice as Record<string, unknown>
          : data;
        const scannedTitle = readText(invoice.description) ?? readText(invoice.title) ?? readText(invoice.name) ?? readText(invoice.merchant) ?? readText(invoice.store);
        const scannedAmount = readAmount(invoice.amount) ?? readAmount(invoice.total) ?? readAmount(invoice.value) ?? readAmount(invoice.totalAmount) ?? readAmount(invoice.valor);
        if (scannedTitle) setTitle(scannedTitle);
        if (scannedAmount) setAmount(scannedAmount);
        setKind('expense');
        Alert.alert(
          'Código QR leído',
          scannedTitle || scannedAmount
            ? 'Revisa los datos cargados, completa lo que falte y guarda el movimiento en Supabase.'
            : 'El código no contiene una descripción o monto compatible. Completa los datos manualmente.',
        );
        return;
      }
    } catch {
      // Los códigos de facturas también pueden contener texto o enlaces, no solo JSON.
    }

    setTitle('Factura escaneada');
    setKind('expense');
    Alert.alert('Código QR leído', 'El código no incluye un monto legible. Escribe el monto y la categoría antes de guardar.');
  };

  const startScan = async (): Promise<void> => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          const canAskAgain = result.canAskAgain ?? permission?.canAskAgain ?? true;
          if (canAskAgain) {
            Alert.alert('Permiso de cámara requerido', 'Autoriza el acceso a la cámara para leer el QR de la factura.');
          } else {
            Alert.alert(
              'Permiso de cámara desactivado',
              'Activa el permiso de cámara desde los ajustes del dispositivo para leer el QR.',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Abrir ajustes', onPress: () => { void Linking.openSettings().catch(() => {}); } },
              ],
            );
          }
          return;
        }
      }
      scannedRef.current = false;
      setIsScanning(true);
    } catch {
      Alert.alert('No se pudo abrir la cámara', 'Verifica el permiso de cámara del dispositivo e inténtalo de nuevo.');
    }
  };

  const handleSave = async (): Promise<void> => {
    const normalizedAmount = amount.trim();
    const numericAmount = Number(normalizedAmount.replace(',', '.'));
    if (!title.trim()) {
      Alert.alert('Falta la descripción', 'Escribe una descripción para el movimiento.');
      return;
    }
    if (title.trim().length > 160) {
      Alert.alert('Descripción muy larga', 'Usa una descripción de hasta 160 caracteres.');
      return;
    }
    if (!/^\d{1,12}(?:[.,]\d{1,2})?$/.test(normalizedAmount) || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto positivo con hasta dos decimales y sin separador de miles.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Falta la categoría', 'Selecciona una categoría para continuar.');
      return;
    }
    if (scope === 'family' && !familyId) {
      Alert.alert('Falta el grupo familiar', 'Crea o selecciona un grupo para continuar.');
      return;
    }

    setSaving(true);
    try {
      await saveTransaction({
        title,
        amount: numericAmount,
        categoryId,
        transactionType: kind,
        scope,
        familyId: scope === 'family' ? familyId : undefined,
      });
      Alert.alert('Movimiento guardado', 'El registro se guardó en Supabase.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Verifica la conexión y vuelve a intentarlo.');
    } finally {
      setSaving(false);
    }
  };

  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerInstruction}>Enfoca el código QR de la factura</Text>
          <View style={styles.scanFrame} />
          <TouchableOpacity style={styles.cancelScanButton} onPress={() => setIsScanning(false)}>
            <Text style={styles.cancelScanText}>Cancelar escaneo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuevo movimiento</Text>

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="Ej. Compra del mercado" value={title} onChangeText={setTitle} maxLength={160} />

      <Text style={styles.label}>Monto</Text>
      <TextInput style={styles.input} placeholderTextColor="#6B7280" placeholder="$0,00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.optionRow}>
        {(['expense', 'income'] as const).map((option) => (
          <TouchableOpacity key={option} style={[styles.option, kind === option && styles.activeOption]} onPress={() => setKind(option)}>
            <Text style={[styles.optionText, kind === option && styles.activeOptionText]}>{option === 'expense' ? 'Gasto' : 'Ingreso'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {kind === 'expense' ? (
        <TouchableOpacity style={styles.qrButton} onPress={() => { void startScan(); }} accessibilityRole="button">
          <Text style={styles.qrButtonText}>▦  Leer QR de factura</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.label}>Guardar en</Text>
      <View style={styles.optionRow}>
        {(['personal', 'family'] as const).map((option) => (
          <TouchableOpacity key={option} style={[styles.option, scope === option && styles.activeOption]} onPress={() => setScope(option)}>
            <Text style={[styles.optionText, scope === option && styles.activeOptionText]}>{option === 'personal' ? 'Personal' : 'Familiar'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {scope === 'family' ? loadingFamilies ? (
        <ActivityIndicator color="#007AFF" />
      ) : families.length > 0 ? (
        <View style={styles.categoryList}>
          {families.map((family) => (
            <TouchableOpacity key={family.id} style={[styles.category, familyId === family.id && styles.activeOption]} onPress={() => setFamilyId(family.id)}>
              <Text style={[styles.optionText, familyId === family.id && styles.activeOptionText]}>{family.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('FamilyGroup')}>
          <Text style={styles.linkText}>Crea un grupo familiar para continuar.</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.label}>Categoría</Text>
      {loadingCategories ? <ActivityIndicator color="#007AFF" /> : categories.length === 0 ? (
        <Text style={styles.helperText}>No hay categorías. Revisa que el esquema de Supabase esté configurado.</Text>
      ) : (
        <View style={styles.categoryList}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={[styles.category, categoryId === category.id && styles.activeOption]} onPress={() => setCategoryId(category.id)}>
              <Text style={[styles.optionText, categoryId === category.id && styles.activeOptionText]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.helperText}>
        {scope === 'family' ? 'El movimiento será visible para los integrantes del grupo.' : 'El movimiento será personal.'}
      </Text>

      <TouchableOpacity
        style={[styles.saveButton, (saving || loadingCategories || !categoryId || (scope === 'family' && (loadingFamilies || !familyId))) && styles.disabledButton]}
        onPress={() => { void handleSave(); }}
        disabled={saving || loadingCategories || !categoryId || (scope === 'family' && (loadingFamilies || !familyId))}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar movimiento'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  option: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, padding: 11 },
  activeOption: { backgroundColor: '#007AFF' },
  optionText: { color: '#007AFF', fontWeight: '600' },
  activeOptionText: { color: '#FFF' },
  qrButton: { backgroundColor: '#0F766E', padding: 13, borderRadius: 9, alignItems: 'center', marginBottom: 16 },
  qrButtonText: { color: '#FFF', fontWeight: 'bold' },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  category: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  linkText: { color: '#007AFF', marginBottom: 16 },
  helperText: { color: '#666', marginBottom: 14 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.55 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80, backgroundColor: 'rgba(0,0,0,0.18)' },
  scannerInstruction: { color: '#FFF', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 3, borderColor: '#FFF', borderRadius: 24, backgroundColor: 'transparent' },
  cancelScanButton: { backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24 },
  cancelScanText: { color: '#1F2937', fontWeight: 'bold' },
});

export default AddTransactionScreen;
