import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { styles } from '@/theme/styles/app_product_id_';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ProductDetail } from '@/features/catalog/components/ProductDetail';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAppBootstrap } from '@/features/bootstrap/AppBootstrapProvider';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allProducts, products } = useAppBootstrap();

  const product = (allProducts ?? products).find((p) => p.id === id) ?? null;

  if (!product) {
    return (
      <ScreenContainer hasHeader>
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
    <ScreenContainer hasHeader>
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

