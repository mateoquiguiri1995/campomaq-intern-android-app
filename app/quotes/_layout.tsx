import { Stack } from 'expo-router';

import { QuoteBuilderProvider } from '@/features/quotes/QuoteBuilderProvider';
import { colors } from '@/theme/colors';

/**
 * Stack del flujo de "nueva cotización": cliente → productos → resumen.
 *
 * El QuoteBuilderProvider vive solo mientras este stack está montado: cada
 * vez que el vendedor entra desde "Nueva cotización" empieza de cero.
 */
export default function QuotesLayout() {
  return (
    <QuoteBuilderProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        }}
      />
    </QuoteBuilderProvider>
  );
}
