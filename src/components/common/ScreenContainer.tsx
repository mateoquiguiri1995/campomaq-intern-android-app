import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ScreenContainerProps extends PropsWithChildren {
  /**
   * Si es true (por defecto) envuelve el contenido en ScrollView.
   * Si es false solamente crea el SafeArea.
   */
  scroll?: boolean;
  /**
   * Si es true, indica que la pantalla ya muestra una cabecera nativa (headerShown: true)
   * y por tanto desactiva el inset superior de SafeAreaView para evitar doble espaciado.
   */
  hasHeader?: boolean;
}

export function ScreenContainer({
  children,
  scroll = true,
  hasHeader = false,
}: ScreenContainerProps) {
  const edges = hasHeader ? [] : (['top'] as const);

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={edges}>
        <View style={styles.nonScrollContent}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.md,
  },

  nonScrollContent: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
});