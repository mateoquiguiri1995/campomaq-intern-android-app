import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ProductDescriptionProps {
  html?: string;
}

/**
 * Ficha técnica del producto. El backend la envía como HTML ya
 * formateado (negritas, listas, tabla de especificaciones).
 *
 * Nota: sin un plugin de tabla, los <table>/<tr>/<td> se muestran
 * como filas apiladas en vez de una grilla real — en pantallas
 * angostas de celular es igual de legible.
 */
export function ProductDescription({ html }: ProductDescriptionProps) {
  const { width } = useWindowDimensions();

  if (!html) {
    return null;
  }

  return (
    <RenderHtml
      contentWidth={width - spacing.md * 2}
      source={{ html }}
      baseStyle={{
        color: colors.grayDark,
        fontSize: 14,
        lineHeight: 20,
      }}
      tagsStyles={{
        h3: {
          color: colors.black,
          fontSize: 16,
          fontWeight: '700',
          marginTop: spacing.md,
          marginBottom: spacing.xs,
        },
        strong: {
          color: colors.black,
        },
        p: {
          marginBottom: spacing.xs,
        },
        li: {
          marginBottom: spacing.xs,
        },
        td: {
          padding: spacing.xs,
          borderColor: colors.border,
          borderWidth: 1,
        },
        th: {
          padding: spacing.xs,
          borderColor: colors.border,
          borderWidth: 1,
          backgroundColor: colors.background,
          fontWeight: '700',
        },
      }}
    />
  );
}
