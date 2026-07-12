import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ProductDetail } from '@/features/catalog/components/ProductDetail';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Pantalla de detalle de producto.
 *
 * El backend no tiene un endpoint GET /products/:id, así que el
 * producto completo viaja serializado como parámetro de navegación
 * desde la lista del catálogo (que ya lo tiene cargado en memoria).
 */
export default function ProductDetailScreen() {
  const { data } = useLocalSearchParams<{ id: string; data?: string }>();

  const product: Product | null = data ? JSON.parse(data) : null;

  if (!product) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ headerShown: true, title: 'Detalle' }} />

        <View style={styles.center}>
          <Text style={styles.message}>
            No pudimos abrir este producto. Vuelve al catálogo e
            inténtalo de nuevo.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          headerShown: true,
          title: product.name,
          headerBackTitle: 'Catálogo',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.black,
          headerShadowVisible: false,
        }}
      />

      <ProductDetail product={product} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  message: {
    textAlign: 'center',
    color: colors.grayDark,
  },
});
