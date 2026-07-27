import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

/**
 * Stack del flujo de "nueva cotización": cliente → productos → resumen.
 */
export default function QuotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.black,
        headerShadowVisible: false,
      }}
    />
  );
}
