import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { useClients } from '@/features/clients/hooks/useClients';
import type { Client } from '@/features/clients/types';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Paso 1 del flujo de cotización: elegir un cliente registrado o registrar uno nuevo (solo para este documento). */
export default function SelectClientScreen() {
  const router = useRouter();
  const { setClient } = useQuoteBuilder();
  const { clientId, clientData } = useLocalSearchParams<{ clientId?: string; clientData?: string }>();

  useEffect(() => {
    if (clientId && clientData) {
      try {
        const parsedClient = JSON.parse(clientData) as Client;
        setClient({ kind: 'registered', client: parsedClient });
        router.replace('/quotes/select-products');
      } catch (e) {
        console.error('Error automatic-selecting client', e);
      }
    }
  }, [clientId, clientData]);

  const {
    clients: filteredClients,
    loading: isLoading,
    searchLoading,
    loadingMore,
    error,
    hasMore,
    hasActiveFilters,
    search,
    setSearch,
    loadMore,
    refresh,
  } = useClients();

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualContact, setManualContact] = useState('');

  function handleSelectRegistered(client: Client) {
    setClient({ kind: 'registered', client });
    router.push('/quotes/select-products');
  }

  function handleConfirmManual() {
    if (!manualName.trim() || !manualContact.trim()) return;
    setClient({ kind: 'manual', client: { name: manualName.trim(), contact: manualContact.trim() } });
    router.push('/quotes/select-products');
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Elegir cliente', headerBackTitle: 'Reportes' }} />

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
      </View>

      {isLoading && (
        <View style={styles.center}>
          <Text style={styles.helperText}>Cargando clientes...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Reintentar" variant="ghost" onPress={refresh} />
        </View>
      )}

      <Pressable style={styles.manualToggle} onPress={() => setShowManualForm((prev) => !prev)}>
        <Text style={styles.manualToggleText}>
          {showManualForm ? '− Ocultar' : '+ Cliente nuevo (no registrado)'}
        </Text>
      </Pressable>

      {showManualForm && (
        <View style={styles.manualForm}>
          <Text style={styles.manualHint}>
            Este cliente solo se guarda en esta cotización. No se sube a la base de datos.
          </Text>
          <TextField label="Nombre" value={manualName} onChangeText={setManualName} placeholder="Nombre del cliente" />
          <TextField
            label="Teléfono o correo"
            value={manualContact}
            onChangeText={setManualContact}
            placeholder="099... o correo@ejemplo.com"
          />
          <Button
            label="Continuar con este cliente"
            onPress={handleConfirmManual}
            disabled={!manualName.trim() || !manualContact.trim()}
          />
        </View>
      )}

      {!isLoading && !error && (
        <View style={styles.list}>
          {filteredClients.length === 0 ? (
            searchLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primaryDark} />
                <Text style={styles.helperText}>Buscando clientes...</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                {hasActiveFilters
                  ? 'No encontramos clientes con esa búsqueda.'
                  : 'No existen clientes disponibles.'}
              </Text>
            )
          ) : (
            filteredClients.map((client) => (
              <Pressable key={client.id} onPress={() => handleSelectRegistered(client)}>
                <ClientCard client={client} />
              </Pressable>
            ))
          )}

          {!hasActiveFilters && hasMore && (
            <Button
              label={loadingMore ? 'Cargando...' : 'Cargar más clientes'}
              variant="ghost"
              onPress={loadMore}
              disabled={loadingMore}
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    fontSize: 15,
    color: colors.black,
  },
  manualToggle: {
    alignSelf: 'flex-start',
  },
  manualToggleText: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  manualForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  manualHint: {
    ...typography.caption,
    color: colors.grayDark,
  },
  list: {
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.grayDark,
  },
  emptyText: {
    ...typography.body,
    color: colors.grayDark,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});
