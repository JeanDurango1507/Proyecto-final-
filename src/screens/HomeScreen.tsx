import React, { useCallback, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList, Transaction } from '../types';
import { getTransactionSummary, listTransactions, TransactionSummary } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const emptySummary: TransactionSummary = {
  income: 0,
  expenses: 0,
  balance: 0,
  transactionCount: 0,
};

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date: string): string => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Verifica tu conexión e inténtalo de nuevo.';

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loadError, setLoadError] = useState('');
  const { user, logout } = useAuth();
  const refreshRef = useRef<(() => void) | null>(null);
  const screenActiveRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const requestVersionRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      screenActiveRef.current = true;
      loadingMoreRef.current = false;
      setLoadingMore(false);

      const load = async (pullToRefresh: boolean): Promise<void> => {
        const requestVersion = ++requestVersionRef.current;
        loadingMoreRef.current = false;
        setLoadingMore(false);
        if (pullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setLoadError('');

        try {
          const [page, totals] = await Promise.all([
            listTransactions(0),
            getTransactionSummary(),
          ]);
          if (!active || requestVersion !== requestVersionRef.current) return;
          setTransactions(page.items);
          setSummary(totals);
          setHasMore(page.hasMore);
          setNextOffset(page.items.length);
        } catch (error: unknown) {
          if (active && requestVersion === requestVersionRef.current) setLoadError(errorMessage(error));
        } finally {
          if (active && requestVersion === requestVersionRef.current) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

      refreshRef.current = () => { void load(true); };
      void load(false);

      return () => {
        active = false;
        screenActiveRef.current = false;
        requestVersionRef.current += 1;
        refreshRef.current = null;
      };
    }, []),
  );

  const loadMore = async (): Promise<void> => {
    if (!hasMore || loadingMoreRef.current) return;
    const requestVersion = requestVersionRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const page = await listTransactions(nextOffset);
      if (!screenActiveRef.current || requestVersion !== requestVersionRef.current) return;
      setTransactions((current) => [...current, ...page.items]);
      setNextOffset((current) => current + page.items.length);
      setHasMore(page.hasMore);
    } catch (error: unknown) {
      if (screenActiveRef.current && requestVersion === requestVersionRef.current) {
        setLoadError(errorMessage(error));
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        loadingMoreRef.current = false;
        if (screenActiveRef.current) setLoadingMore(false);
      }
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error: unknown) {
      setLoadError(`No se pudo cerrar sesión: ${errorMessage(error)}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {user?.firstName ? `¡Hola, ${user.firstName}!` : '¡Hola de nuevo!'}
        </Text>
        <TouchableOpacity onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saldo total</Text>
        {loading && transactions.length === 0 ? (
          <ActivityIndicator color="#FFF" style={styles.balanceLoading} />
        ) : (
          <Text style={styles.balanceText}>{formatAmount(summary.balance)}</Text>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Ingresos  {formatAmount(summary.income)}</Text>
          <Text style={styles.summaryText}>Gastos  {formatAmount(summary.expenses)}</Text>
        </View>
        <Text style={styles.countText}>{summary.transactionCount} movimientos en total</Text>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>+ Movimiento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.familyButton]}
          onPress={() => navigation.navigate('FamilyGroup')}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>Grupos familiares</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Movimientos recientes</Text>
      {loadError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity onPress={() => refreshRef.current?.()} accessibilityRole="button">
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && transactions.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : (
        <FlatList
          style={styles.list}
          data={transactions}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          windowSize={7}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => refreshRef.current?.()} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no tienes movimientos guardados.</Text>
          }
          ListFooterComponent={hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => { void loadMore(); }}
              disabled={loadingMore}
              accessibilityRole="button"
            >
              {loadingMore ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.loadMoreText}>Cargar más movimientos</Text>}
            </TouchableOpacity>
          ) : null}
          renderItem={({ item }) => {
            const isIncome = item.transactionType === 'income';
            return (
              <View style={styles.transactionRow}>
                <View style={styles.transactionDetails}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {formatDate(item.date)} · {item.category} · {item.type === 'Family' ? 'Familiar' : 'Personal'}
                  </Text>
                </View>
                <Text style={isIncome ? styles.income : styles.expense}>
                  {isIncome ? '+' : '-'}{formatAmount(Math.abs(item.amount))}
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
  balanceLoading: { alignSelf: 'flex-start', marginTop: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  summaryText: { color: '#EAF2FF', fontSize: 12, flexShrink: 1 },
  countText: { color: '#D5E6FF', fontSize: 11, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: { flex: 1, backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center' },
  familyButton: { backgroundColor: '#007AFF' },
  actionText: { color: '#FFF', fontWeight: 'bold' },
  loading: { marginTop: 20 },
  list: { flex: 1 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
  errorCard: { backgroundColor: '#FFF2F0', padding: 12, borderRadius: 8, marginBottom: 8 },
  errorText: { color: '#A61B1B', marginBottom: 6 },
  retryText: { color: '#007AFF', fontWeight: 'bold' },
  loadMoreButton: { padding: 14, alignItems: 'center', marginBottom: 12 },
  loadMoreText: { color: '#007AFF', fontWeight: '600' },
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
