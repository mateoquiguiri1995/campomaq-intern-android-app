import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ClientList } from '@/features/clients/components/ClientList';
import { useClients } from '@/features/clients/hooks/useClients';
import type { Client } from '@/features/clients/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';

/** Pestaña Clientes. */
export default function ClientsScreen() {
  const router = useRouter();
  const [clientFilter, setClientFilter] = useState<ClientFilter>('Todos');
  const { resetBuilder } = useQuoteBuilder();
  const {
    clients,
    loading,
    searchLoading,
    loadingMore,
    error,
    hasMore,
    hasActiveFilters: hasSearchFilter,
    search,
    setSearch,
    loadMore,
    refresh,
  } = useClients();



  const filteredClients = useMemo(() => {
    if (clientFilter === 'Todos') return clients;
    if (clientFilter === 'Crédito') {
      return clients.filter((client) => client.hasPendingCredit);
    }
    return clients.filter((client) => client.score === clientFilter);
  }, [clients, clientFilter]);

  const hasActiveFilters = hasSearchFilter || clientFilter !== 'Todos';

  function openClientDetail(client: Client) {
    router.push({
      pathname: '/client/[id]',
      params: { id: client.id, data: JSON.stringify(client) },
    });
  }

  function handleNewQuote() {
    resetBuilder();
    router.push('/quotes/select-client');
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Clientes</Text>
        </View>

        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.message}>Cargando clientes...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Clientes</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.errorTitle}>No pudimos cargar los clientes</Text>
          <Text style={styles.message}>{error}</Text>
          <Button label="Reintentar" variant="ghost" onPress={refresh} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.topGroup}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Clientes</Text>
        </View>

        <View style={styles.searchRow}>
          {searchLoading ? (
            <ActivityIndicator size="small" color={colors.gray} style={styles.searchIcon} />
          ) : (
            <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
          )}

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente, RUC..."
            placeholderTextColor={colors.gray}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity style={styles.clearIcon} onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {CLIENT_FILTERS.map((filter) => {
              const isActive = clientFilter === filter;
              const iconName = filter === 'Todos' ? 'list' : filter === 'Crédito' ? 'card' : 'star';
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setClientFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={iconName}
                    size={14}
                    color={isActive ? '#FFFFFF' : '#666666'}
                  />
                  <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {filteredClients.length > 0 && (
          <Text style={styles.countText}>
            {filteredClients.length} {filteredClients.length === 1 ? 'cliente asignado' : 'clientes asignados'} a tu ruta
          </Text>
        )}
      </View>

      {filteredClients.length === 0 && !hasActiveFilters ? (
        <View style={styles.center}>
          <Text style={styles.message}>No existen clientes disponibles.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ClientList
            clients={filteredClients}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => {
              setSearch('');
              setClientFilter('Todos');
            }}
            searching={searchLoading}
            onPressClient={openClientDetail}
          />
        </View>
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.7} onPress={handleNewQuote}>
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

type ClientFilter = 'Todos' | 'A+' | 'A' | 'B' | 'Crédito';

const CLIENT_FILTERS: ClientFilter[] = ['Todos', 'A+', 'A', 'B', 'Crédito'];

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
  },

  searchRow: {
    justifyContent: 'center',
    marginBottom: 0,
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + spacing.xs,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.xl,
    height: 48,
    fontSize: 14,
    color: colors.black,
  },
  clearIcon: {
    position: 'absolute',
    right: spacing.sm + spacing.xs,
  },
  filtersWrapper: {
    marginBottom: 0,
  },
  filtersScroll: {
    paddingRight: spacing.md,
    gap: spacing.xs + 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  filterLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.grayDark,
    marginTop: 4,
    marginBottom: 2,
  },
  topGroup: {
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.grayDark,
  },
  errorTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#D32F2F',
  },
});
