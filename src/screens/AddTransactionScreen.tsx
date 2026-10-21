import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Category, RootStackParamList, TransactionKind } from '../types';
import { createTransaction, getCategories } from '../services/transactionsService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingCategories(true);
    setCategoryId('');

    getCategories(kind)
      .then((result) => {
        if (active) {
          setCategories(result);
          setCategoryId(result[0]?.id ?? '');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          Alert.alert(
            'No se pudieron cargar las categorías',
            error instanceof Error ? error.message : 'Verifica la conexión con Supabase.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadingCategories(false);
        }
      });

    return () => {
      active = false;
    };
  }, [kind]);

  const handleSave = async (): Promise<void> => {
    const numericAmount = Number(amount.replace(',', '.'));
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe una descripción para el movimiento.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor que cero.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Falta la categoría', 'Selecciona una categoría para continuar.');
      return;
    }

    setSaving(true);
    try {
      await createTransaction({ title, amount: numericAmount, categoryId, kind });
      Alert.alert('Movimiento guardado', 'El registro se guardó en Supabase.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo guardar',
        error instanceof Error ? error.message : 'Verifica la conexión y vuelve a intentarlo.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nuevo movimiento personal</Text>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Compra del mercado"
        value={title}
        onChangeText={setTitle}
        maxLength={160}
      />

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        placeholder="$0,00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.optionRow}>
        {(['expense', 'income'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, kind === option && styles.activeOption]}
            onPress={() => setKind(option)}
          >
            <Text style={[styles.optionText, kind === option && styles.activeOptionText]}>
              {option === 'expense' ? 'Gasto' : 'Ingreso'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Categoría</Text>
      {loadingCategories ? (
        <ActivityIndicator color="#007AFF" />
      ) : categories.length === 0 ? (
        <Text style={styles.helperText}>
          No hay categorías. Verifica que el esquema SQL de Supabase se haya ejecutado.
        </Text>
      ) : (
        <View style={styles.categoryList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.category, categoryId === category.id && styles.activeOption]}
              onPress={() => setCategoryId(category.id)}
            >
              <Text style={[styles.optionText, categoryId === category.id && styles.activeOptionText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.helperText}>El registro se asociará a tu cuenta personal.</Text>

      <TouchableOpacity
        style={[styles.saveButton, (saving || loadingCategories || !categoryId) && styles.disabledButton]}
        onPress={handleSave}
        disabled={saving || loadingCategories || !categoryId}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar movimiento'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, marginBottom: 18 },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  option: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, padding: 12 },
  activeOption: { backgroundColor: '#007AFF' },
  optionText: { color: '#007AFF', fontWeight: '600' },
  activeOptionText: { color: '#FFF' },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  category: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  helperText: { color: '#666', marginBottom: 16 },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.55 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AddTransactionScreen;
