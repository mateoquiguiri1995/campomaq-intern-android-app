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
  const { startNewQuote } = useQuoteBuilder();
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
    router.push(`/client/${client.id}`);
  }

  function handleNewQuote() {
    startNewQuote();
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
        <View style={inlineLayoutStyles.clientsFlexFill}>
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

import { styles } from '@/theme/styles/app_tabs_clients';
import { inlineLayoutStyles } from '@/theme/styles/inlineLayout';
