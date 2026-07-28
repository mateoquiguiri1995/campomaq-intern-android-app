import { StyleSheet } from 'react-native';

import { spacing } from '@/theme/spacing';

/**
 * Sustituye los estilos en línea detectados en profile, client/[id] y tabs/clients.
 * Uso: importar `inlineLayoutStyles` en la pantalla correspondiente.
 */
export const inlineLayoutStyles = StyleSheet.create({
  profileHeaderSpacer: { width: 24 },
  clientHeaderAction: { marginRight: spacing.sm },
  clientsFlexFill: { flex: 1 },
});
