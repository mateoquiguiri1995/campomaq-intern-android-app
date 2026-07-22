import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ClientList } from '@/features/clients/components/ClientList';
import { useClients } from '@/features/clients/hooks/useClients';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

/** Pestaña Clientes. */
export default function ClientsScreen() {
  const {
    clients,
    loading,
    searchLoading,
    loadingMore,
    error,
    hasClients,
    hasMore,
    hasActiveFilters,
    search,
    setSearch,
    loadMore,
  } = useClients();

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

      {!hasClients && !hasActiveFilters ? (
        <View style={styles.center}>
          <Text style={styles.message}>No existen clientes disponibles.</Text>
        </View>
      ) : (
        <ClientList
          clients={clients}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => setSearch('')}
          searching={searchLoading}
        />
      )}
    </ScreenContainer>
  );
}

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
