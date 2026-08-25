import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { ClientList } from '@/features/clients/components/ClientList';
import { useClients } from '@/features/clients/hooks/useClients';
import type { Client } from '@/features/clients/types';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/app_quotes_select-client';

/** Paso 1 del flujo de cotizacion: elegir un cliente registrado o registrar uno nuevo solo para este documento. */
export default function SelectClientScreen() {
  const router = useRouter();
  const { setClient } = useQuoteBuilder();
  const { clientId, clientData } = useLocalSearchParams<{ clientId?: string; clientData?: string }>();

  useEffect(() => {
    if (!clientId || !clientData) return;
    try {
      const parsedClient = JSON.parse(clientData) as Client;
      setClient({ kind: 'registered', client: parsedClient });
      router.replace('/quotes/select-products');
    } catch (error) {
      console.error('Error automatic-selecting client', error);
    }
  }, [clientId, clientData, router, setClient]);

  const { clients, loading, searchLoading, loadingMore, error, hasMore, hasActiveFilters, search, setSearch, loadMore, refresh, refreshing } = useClients();
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
    <ScreenContainer scroll={false}>
      <Stack.Screen options={{ title: 'Elegir cliente', headerBackTitle: 'Reportes' }} />
      <View style={styles.searchRow}>
        {searchLoading ? <ActivityIndicator size="small" color={colors.gray} style={styles.searchIcon} /> : <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />}
        <TextInput style={styles.searchInput} placeholder="Buscar cliente" placeholderTextColor={colors.gray} value={search} onChangeText={setSearch} returnKeyType="search" />
      </View>

      <Pressable style={styles.manualToggle} onPress={() => setShowManualForm((current) => !current)}>
        <Text style={styles.manualToggleText}>{showManualForm ? '− Ocultar' : '+ Cliente nuevo (no registrado)'}</Text>
      </Pressable>

      {showManualForm && (
        <View style={styles.manualForm}>
          <Text style={styles.manualHint}>Este cliente solo se guarda en esta cotizacion. No se sube a la base de datos.</Text>
          <TextField label="Nombre" value={manualName} onChangeText={setManualName} placeholder="Nombre del cliente" />
          <TextField label="Telefono o correo" value={manualContact} onChangeText={setManualContact} placeholder="099... o correo@ejemplo.com" />
          <Button label="Continuar con este cliente" onPress={handleConfirmManual} disabled={!manualName.trim() || !manualContact.trim()} />
        </View>
      )}

      {loading ? (
        <View style={styles.center}><Text style={styles.helperText}>Cargando clientes...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Button label="Reintentar" variant="ghost" onPress={refresh} /></View>
      ) : (
        <ClientList
          clients={clients}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          hasActiveFilters={hasActiveFilters}
          searching={searchLoading}
          onClearFilters={() => setSearch('')}
          onPressClient={handleSelectRegistered}
          refreshing={refreshing}
          onRefresh={refresh}
        />
      )}
    </ScreenContainer>
  );
}
