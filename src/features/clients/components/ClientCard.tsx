import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Client } from '../types';
import { ClientAvatar } from './ClientAvatar';

interface ClientCardProps {
  client: Client;
}

/** Tarjeta reutilizable de cliente para listados y selección de cotización. */
export function ClientCard({ client }: ClientCardProps) {
  const contactLine = [client.email, client.phone].filter(Boolean).join(' · ');
  const location = client.location && client.location.length > 38
    ? `${client.location.slice(0, 38).trimEnd()}...`
    : client.location;

  return (
    <View style={styles.card}>
      <ClientAvatar name={client.name} />
      <View style={styles.content}>
        <Text style={styles.name}>{client.name}</Text>
        {contactLine ? <Text style={styles.contact} numberOfLines={1}>{contactLine}</Text> : null}
        <View style={styles.footerRow}>
          <Text style={styles.ruc}>RUC/CI: {client.ruc}</Text>
          {location ? <Text style={styles.location} numberOfLines={1}>{location}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  content: {
    flex: 1,
    minWidth: 0,
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
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ruc: {
    ...typography.caption,
    color: colors.gray,
    flexShrink: 1,
  },
  location: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});
