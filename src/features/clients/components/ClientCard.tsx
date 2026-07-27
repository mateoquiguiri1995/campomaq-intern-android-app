import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Client } from '../types';
import { ClientAvatar } from './ClientAvatar';

interface ClientCardProps {
  client: Client;
}

function formatListCurrency(value?: number): string {
  if (value === undefined) return '';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `$${formatted}`;
}

function formatLastPurchaseDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00`);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `Últ. compra ${day} ${month} ${year}`;
}

export function ClientCard({ client }: ClientCardProps) {
  const lastPurchase = formatLastPurchaseDate(client.lastPurchaseDate);
  const subtitle = [client.location, lastPurchase].filter(Boolean).join(' - ');

  return (
    <View style={styles.card}>
      <ClientAvatar name={client.name} size={48} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{client.name}</Text>
          {client.score ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>{client.score}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || `RUC: ${client.ruc}`}
        </Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.total}>{formatListCurrency(client.totalPurchases)}</Text>
        <Text style={styles.totalLabel}>vida total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
    fontSize: 15,
  },
  scoreBadge: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FBEEC8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  scoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B25E00',
  },
  subtitle: {
    ...typography.caption,
    color: colors.grayDark,
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
});
