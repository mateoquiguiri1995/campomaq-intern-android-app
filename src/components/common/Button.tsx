import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  /** `primary` (amarillo, relleno) es la única acción principal de la pantalla; `ghost` es libre, sin caja, para alternativas. */
  variant?: ButtonVariant;
  /** Ícono opcional a la izquierda del texto (ej. de @expo/vector-icons). */
  icon?: ReactNode;
}

/** Botón base de la app: misma tipografía y estados en toda la UI. */
export function Button({ label, variant = 'primary', icon, disabled, ...pressableProps }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...pressableProps}
    >
      {icon}
      <Text style={variant === 'primary' ? styles.primaryLabel : styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
  ghostLabel: {
    ...typography.button,
    color: colors.black,
  },
});
