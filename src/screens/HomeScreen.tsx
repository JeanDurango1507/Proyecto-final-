import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Transaction } from '../types';
import { getTransactions } from '../services/transactionsService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      getTransactions()
        .then((result) => {
          if (active) {
            setTransactions(result);
          }
        })
        .catch((error: unknown) => {
          if (active) {
            Alert.alert(
              'No se pudieron cargar los movimientos',
              error instanceof Error ? error.message : 'Verifica la conexión con Supabase.',
            );
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const balance = transactions.reduce(
    (total, transaction) =>
      total + (transaction.transactionKind === 'income' ? transaction.amount : -transaction.amount),
    0,
  );

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo cerrar sesión',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user?.firstName ? `¡Hola, ${user.firstName}!` : '¡Hola de nuevo!'}
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saldo de tus movimientos</Text>
        <Text style={styles.balanceText}>{formatAmount(balance)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Text style={styles.actionText}>+ Registrar movimiento</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Movimientos recientes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no tienes movimientos guardados.</Text>
          }
          renderItem={({ item }) => {
            const isIncome = item.transactionKind === 'income';
            return (
              <View style={styles.transactionRow}>
                <View style={styles.transactionDetails}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.date} · {item.category}
                  </Text>
                </View>
                <Text style={isIncome ? styles.income : styles.expense}>
                  {isIncome ? '+' : '-'}{formatAmount(item.amount)}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  logout: { color: '#007AFF', marginBottom: 15 },
  card: { backgroundColor: '#007AFF', padding: 20, borderRadius: 12, marginBottom: 20 },
  cardTitle: { color: '#E0E0E0', fontSize: 14 },
  balanceText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  actionButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#FFF', fontWeight: 'bold' },
  loading: { marginTop: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionDetails: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  income: { color: '#28A745', fontWeight: 'bold', fontSize: 16 },
  expense: { color: '#DC3545', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;
