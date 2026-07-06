import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ClientCard } from '@/features/clients/components/ClientCard';
import { getClients } from '@/features/clients/services/clientService';
import type { Client } from '@/features/clients/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

/**
 * Pestaña Clientes.
 *
 * TODO(Fase 3): conectar al backend API real (clientService).
 * TODO(Fase 3): búsqueda real de clientes (hoy el input no filtra).
 * TODO(Fase 3): pantalla de detalle de cliente.
 * TODO(Fase 3): historial de compras del cliente.
 */
export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="Clientes" subtitle="Cartera de clientes" />

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar cliente..."
        placeholderTextColor={colors.gray}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.list}>
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </View>
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
  list: {
    gap: spacing.md,
  },
});
