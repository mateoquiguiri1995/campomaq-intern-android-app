import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

interface ClientAvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? 'C';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
}

/** Avatar simple de cliente mientras la API no entregue una fotografía real. */
export function ClientAvatar({ name, size = 48 }: ClientAvatarProps) {
  const borderRadius = size >= 70 ? 16 : 10;
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.initials, { fontSize: size >= 70 ? 24 : 16 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
  },
});
