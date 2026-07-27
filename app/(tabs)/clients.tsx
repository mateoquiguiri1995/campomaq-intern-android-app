import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ClientList } from '@/features/clients/components/ClientList';
import { useClients } from '@/features/clients/hooks/useClients';
import type { Client } from '@/features/clients/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

/** Pestaña Clientes. */
export default function ClientsScreen() {
  const router = useRouter();
  const [clientFilter, setClientFilter] = useState<ClientFilter>('Todos');
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
    if (clientFilter === 'Crédito pendiente') {
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

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Clientes" subtitle="Cartera de clientes" />

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
        <AppHeader title="Clientes" subtitle="Cartera de clientes" />

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
      <AppHeader title="Clientes" subtitle="Cartera de clientes" />

      <View style={styles.searchRow}>
        {searchLoading ? (
          <ActivityIndicator size="small" color={colors.gray} style={styles.searchIcon} />
        ) : (
          <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
        )}

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
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

      <View style={styles.filters}>
        {CLIENT_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, clientFilter === filter && styles.filterChipActive]}
            onPress={() => setClientFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterLabel, clientFilter === filter && styles.filterLabelActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredClients.length === 0 && !hasActiveFilters ? (
        <View style={styles.center}>
          <Text style={styles.message}>No existen clientes disponibles.</Text>
        </View>
      ) : (
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
      )}
    </ScreenContainer>
  );
}

type ClientFilter = 'Todos' | 'A+' | 'A' | 'B' | 'Crédito pendiente';

const CLIENT_FILTERS: ClientFilter[] = ['Todos', 'A+', 'A', 'B', 'Crédito pendiente'];

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 2,
};

const styles = StyleSheet.create({
  searchRow: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + spacing.xs,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.xl,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.black,
    ...shadow,
  },
  clearIcon: {
    position: 'absolute',
    right: spacing.sm + spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.grayDark,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: colors.black,
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
