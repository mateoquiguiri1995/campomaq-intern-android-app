import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PlaceholderCardProps {
  title: string;
  description?: string;
  /** Emoji simple para no depender de librerías de íconos. */
  icon?: string;
}

/** Tarjeta genérica para secciones que aún no tienen contenido real. */
export function PlaceholderCard({ title, description, icon }: PlaceholderCardProps) {
  return (
    <View style={styles.card}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </View>
  );
}

import { styles } from '@/theme/styles/src_components_common_PlaceholderCard';
