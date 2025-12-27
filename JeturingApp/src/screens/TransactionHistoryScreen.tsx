/**
 * Transaction History Screen
 * Paginated list of all transactions with filtering and search
 * 
 * @module TransactionHistoryScreen
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripeAccount } from '../contexts/StripeAccountContext';
import axios from 'axios';

const API_URL = 'https://api.jeturing.com';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'canceled' | 'requires_payment_method' | 'processing';
  created: number;
  description?: string;
  customer?: string;
  receipt_url?: string;
  payment_method_types: string[];
  application_fee_amount?: number;
}

interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  successful_amount: number;
  successful_count: number;
  total_fees: number;
  period: string;
}

type FilterStatus = 'all' | 'succeeded' | 'pending' | 'canceled';

const FILTERS: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Exitosos', value: 'succeeded' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Cancelados', value: 'canceled' },
];

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { account } = useStripeAccount();
  
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(true);
  
  const lastTransactionId = useRef<string | null>(null);
  const summaryAnim = useRef(new Animated.Value(1)).current;

  // Format currency
  const formatCurrency = (cents: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    return formatDate(timestamp);
  };

  // Get status info
  const getStatusInfo = (status: string): { color: string; label: string; bgColor: string } => {
    switch (status) {
      case 'succeeded':
        return { color: '#059669', label: 'Exitoso', bgColor: '#d1fae5' };
      case 'pending':
      case 'processing':
        return { color: '#d97706', label: 'Pendiente', bgColor: '#fef3c7' };
      case 'canceled':
        return { color: '#dc2626', label: 'Cancelado', bgColor: '#fee2e2' };
      case 'requires_payment_method':
        return { color: '#6b7280', label: 'Incompleto', bgColor: '#f3f4f6' };
      default:
        return { color: '#6b7280', label: status, bgColor: '#f3f4f6' };
    }
  };

  // Fetch transactions
  const fetchTransactions = useCallback(async (refresh: boolean = false) => {
    if (!account?.id) return;

    try {
      const params: any = { limit: 20 };
      
      if (!refresh && lastTransactionId.current) {
        params.starting_after = lastTransactionId.current;
      }
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await axios.get(
        `${API_URL}/api/transactions/${account.id}`,
        { params }
      );

      const newTransactions = response.data.data;
      setHasMore(response.data.has_more);

      if (newTransactions.length > 0) {
        lastTransactionId.current = newTransactions[newTransactions.length - 1].id;
      }

      if (refresh) {
        setTransactions(newTransactions);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [account?.id, filter]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!account?.id) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/transactions/${account.id}/summary`,
        { params: { period: 'month' } }
      );
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [account?.id]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      lastTransactionId.current = null;
      await Promise.all([fetchTransactions(true), fetchSummary()]);
      setLoading(false);
    };
    loadData();
  }, [filter]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    lastTransactionId.current = null;
    await Promise.all([fetchTransactions(true), fetchSummary()]);
    setRefreshing(false);
  };

  // Load more handler
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchTransactions(false);
    setLoadingMore(false);
  };

  // Toggle summary visibility
  const toggleSummary = () => {
    Animated.timing(summaryAnim, {
      toValue: showSummary ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowSummary(!showSummary);
  };

  // Filter transactions by search
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.id.toLowerCase().includes(query) ||
      tx.description?.toLowerCase().includes(query) ||
      formatCurrency(tx.amount).includes(query)
    );
  });

  // Navigate to detail
  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  };

  // Render summary card
  const renderSummary = () => {
    if (!summary) return null;

    const summaryHeight = summaryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 180],
    });

    return (
      <Animated.View style={[styles.summaryContainer, { height: summaryHeight, opacity: summaryAnim }]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen del Mes</Text>
            <TouchableOpacity onPress={toggleSummary}>
              <Text style={styles.summaryToggle}>Ocultar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.successful_amount)}
              </Text>
              <Text style={styles.summaryLabel}>Ingresos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.successful_count}</Text>
              <Text style={styles.summaryLabel}>Transacciones</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.total_fees)}
              </Text>
              <Text style={styles.summaryLabel}>Comisiones</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Render filter pills
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {FILTERS.map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.filterPill,
            filter === value && styles.filterPillActive,
          ]}
          onPress={() => setFilter(value)}
        >
          <Text
            style={[
              styles.filterPillText,
              filter === value && styles.filterPillTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionMain}>
          <View style={styles.transactionLeft}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionAmount}>
                {formatCurrency(item.amount, item.currency)}
              </Text>
              <Text style={styles.transactionTime}>
                {formatRelativeTime(item.created)}
              </Text>
            </View>
          </View>

          <View style={styles.transactionRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.paymentMethod}>
              {item.payment_method_types[0]?.replace('_', ' ') || 'Card'}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}

        {item.application_fee_amount && item.application_fee_amount > 0 && (
          <Text style={styles.transactionFee}>
            Comisión: {formatCurrency(item.application_fee_amount, item.currency)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color="#6366f1" size="small" />
        <Text style={styles.loadingMoreText}>Cargando más...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>Sin transacciones</Text>
      <Text style={styles.emptyText}>
        {filter !== 'all' 
          ? `No hay transacciones ${FILTERS.find(f => f.value === filter)?.label.toLowerCase()}`
          : 'Comienza a recibir pagos para ver tu historial aquí'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        {!showSummary && (
          <TouchableOpacity onPress={toggleSummary}>
            <Text style={styles.showSummaryButton}>Ver resumen</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      {renderSummary()}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar transacciones..."
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearch}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  showSummaryButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },

  // Summary
  summaryContainer: {
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryToggle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clearSearch: {
    position: 'absolute',
    right: 36,
    top: 12,
    padding: 4,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#9ca3af',
  },

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterPillActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  transactionTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  transactionDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    paddingLeft: 22,
  },
  transactionFee: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
    paddingLeft: 22,
  },

  // Loading More
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default TransactionHistoryScreen;
