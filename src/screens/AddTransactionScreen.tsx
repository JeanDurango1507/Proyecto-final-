import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TransactionType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [scope, setScope] = useState<TransactionType>('Personal');

  const handleSave = (): void => {
    // Logic to save transaction
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Transaction</Text>

      <TextInput
        style={styles.input}
        placeholder="Amount ($0.00)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Groceries, Transport)"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Transaction Scope:</Text>
      <View style={styles.scopeRow}>
        <TouchableOpacity
          style={[styles.scopeButton, scope === 'Personal' && styles.activeScope]}
          onPress={() => setScope('Personal')}
        >
          <Text style={scope === 'Personal' ? styles.activeText : styles.inactiveText}>Personal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scopeButton, scope === 'Family' && styles.activeScope]}
          onPress={() => setScope('Family')}
        >
          <Text style={scope === 'Family' ? styles.activeText : styles.inactiveText}>Family</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '500' },
  scopeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  scopeButton: { flex: 0.48, padding: 12, borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, alignItems: 'center' },
  activeScope: { backgroundColor: '#007AFF' },
  activeText: { color: '#FFF', fontWeight: 'bold' },
  inactiveText: { color: '#007AFF', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AddTransactionScreen;