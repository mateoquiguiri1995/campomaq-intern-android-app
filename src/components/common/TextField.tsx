import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TextFieldProps extends TextInputProps {
  label: string;
  /** Ícono opcional a la izquierda del input (ej. de @expo/vector-icons). */
  icon?: ReactNode;
  /** Ícono/acción opcional a la derecha del input (ej. mostrar/ocultar contraseña). */
  rightIcon?: ReactNode;
}

/**
 * Input de texto "libre": sin caja ni fondo, solo una línea inferior.
 * Base de todos los formularios (login, búsquedas, etc.).
 */
export function TextField({ label, icon, rightIcon, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {icon}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.gray}
          {...inputProps}
        />
        {rightIcon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  input: {
    flex: 1,
    padding: 0,
    ...typography.body,
    fontSize: 16,
    color: colors.black,
  },
});
