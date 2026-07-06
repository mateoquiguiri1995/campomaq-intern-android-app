import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Client } from '../types';

interface ClientCardProps {
  client: Client;
}

/**
 * Tarjeta de cliente.
 *
 * TODO(Fase 3): al tocar la tarjeta, navegar al detalle del cliente
 *   (historial de compras, acciones de contacto, "Nueva cotización").
 */
export function ClientCard({ client }: ClientCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{client.name}</Text>
      <Text style={styles.contact}>{client.contactPerson}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.ruc}>RUC/CI: {client.ruc}</Text>
        {client.location ? <Text style={styles.location}>{client.location}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '600',
  },
  contact: {
    ...typography.body,
    color: colors.grayDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ruc: {
    ...typography.caption,
    color: colors.gray,
  },
  location: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '500',
  },
});
