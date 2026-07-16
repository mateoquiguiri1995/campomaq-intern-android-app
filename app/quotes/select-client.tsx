import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TextField } from '@/components/common/TextField';
import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';
import { ClientCard } from '@/features/clients/components/ClientCard';
import type { Client } from '@/features/clients/types';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Paso 1 del flujo de cotización: elegir un cliente registrado o registrar uno nuevo (solo para este documento). */
export default function SelectClientScreen() {
  const router = useRouter();
  const { setClient } = useQuoteBuilder();
  const { clients: bootClients, isLoading, error, reload } = useAppBootstrap();

  const [search, setSearch] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualContact, setManualContact] = useState('');

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bootClients;

    return bootClients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.ruc.toLowerCase().includes(query) ||
        (client.email ?? '').toLowerCase().includes(query) ||
        (client.phone ?? '').toLowerCase().includes(query)
    );
  }, [bootClients, search]);

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

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar cliente..."
        placeholderTextColor={colors.gray}
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.helperText}>Mostrando los clientes precargados al iniciar la app.</Text>

      {isLoading && (
        <View style={styles.center}>
          <Text style={styles.helperText}>Cargando clientes...</Text>
        </View>
      )}

      {error && !isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Reintentar" variant="ghost" onPress={reload} />
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
            <Text style={styles.emptyText}>No encontramos clientes con esa búsqueda.</Text>
          ) : (
            filteredClients.map((client) => (
              <Pressable key={client.id} onPress={() => handleSelectRegistered(client)}>
                <ClientCard client={client} />
              </Pressable>
            ))
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
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
