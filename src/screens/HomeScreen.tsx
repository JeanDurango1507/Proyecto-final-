import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Transaction } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Datos ficticios integrados directamente
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Supermercado', amount: -85.50, category: 'Comida', date: '2026-09-20', type: 'Personal' },
  { id: '2', title: 'Pago de Nómina', amount: 1500.00, category: 'Ingreso', date: '2026-09-15', type: 'Personal' },
  { id: '3', title: 'Servicio de Internet', amount: -45.00, category: 'Servicios', date: '2026-09-10', type: 'Family' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Carga simulada
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>¡Hola de nuevo!</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saldo Total</Text>
        <Text style={styles.balanceText}>$2,339.50</Text>
      </View>

      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.actionText}>+ Registrar Gasto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FamilyGroup')}
        >
          <Text style={styles.actionText}>Grupo Familiar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionRow}>
              <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.type === 'Family' ? 'Familiar' : 'Personal'} • {item.category}
                </Text>
              </View>
              <Text style={item.amount > 0 ? styles.income : styles.expense}>
                {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  greeting: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: '#007AFF', padding: 20, borderRadius: 12, marginBottom: 20 },
  cardTitle: { color: '#E0E0E0', fontSize: 14 },
  balanceText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { flex: 0.48, backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: 'bold' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSubtitle: { fontSize: 12, color: '#888' },
  income: { color: '#28A745', fontWeight: 'bold', fontSize: 16 },
  expense: { color: '#DC3545', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;