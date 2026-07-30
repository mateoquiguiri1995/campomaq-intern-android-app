import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { styles } from '@/theme/styles/app_quotes_select-client';
import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { getClients } from '@/features/clients/services/clientService';
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
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();

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

  useEffect(() => {
    if (clientId) {
      let found = filteredClients.find(c => c.id === clientId);
      if (found) {
        setClient({ kind: 'registered', client: found });
        router.replace('/quotes/select-products');
      } else if (!isLoading) {
        getClients({ q: clientId }).then(res => {
          const match = res.clients.find(c => c.id === clientId);
          if (match) {
            setClient({ kind: 'registered', client: match });
            router.replace('/quotes/select-products');
          }
        }).catch(err => {
          console.warn('[select-client] Error looking up client by ID:', err);
        });
      }
    }
  }, [clientId, filteredClients, isLoading]);

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

