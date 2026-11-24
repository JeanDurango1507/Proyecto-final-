import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';

const TRANSACTIONS_KEY = '@app_transactions_list';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      const list = stored ? JSON.parse(stored) : [];
      setTransactions(list);

      const currentBal = list.reduce((acc: number, item: any) => {
        const val = Math.abs(item.amount);
        return item.type === 'income' ? acc + val : acc - val;
      }, 0);

      setBalance(Math.max(0, currentBal));
    } catch (e) {
      setBalance(0);
      setTransactions([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionCard}>
      <View>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionSub}>
          {item.date} · {item.type === 'income' ? 'Ingreso' : 'Gasto'}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? '#16a34a' : '#2563eb' },
        ]}
      >
        ${formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>¡Hola, {user?.firstName || 'Jean'}!</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo de tus movimientos</Text>
        <Text style={styles.balanceValue}>${formatCurrency(balance)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.actionBtnText}>+ Movimiento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.groupBtn}
          onPress={() => navigation.navigate('FamilyGroup')}
        >
          <Text style={styles.actionBtnText}>Grupos familiares</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Movimientos recientes</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>
          Aún no tienes movimientos. Presiona "+ Movimiento" para comenzar.
        </Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logoutText: {
    color: '#0284c7',
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#0066ff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#dbeafe',
    fontSize: 14,
    marginBottom: 6,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  groupBtn: {
    flex: 1,
    backgroundColor: '#0066ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  transactionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});