import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { styles } from '@/theme/styles/app_product_id_';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ProductDetail } from '@/features/catalog/components/ProductDetail';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { shareProductTechnicalSheetPdf } from '@/features/catalog/services/productPdf';

/**
 * Pantalla de detalle de producto.
 *
 * El backend no tiene un endpoint GET /products/:id, así que el
 * producto completo viaja serializado como parámetro de navegación
 * desde la lista del catálogo (que ya lo tiene cargado en memoria).
 */
export default function ProductDetailScreen() {
  const { data } = useLocalSearchParams<{ id: string; data?: string }>();

  let product: Product | null = null;
  const [isSharing, setIsSharing] = useState(false);

  try {
    product = data ? JSON.parse(data) : null;
  } catch {
    product = null;
  }

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

  async function handleShareTechnicalSheet() {
    if (isSharing || !product) return;
    try {
      setIsSharing(true);
      await shareProductTechnicalSheetPdf(product);
    } catch (error) {
      Alert.alert('No se pudo compartir', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setIsSharing(false);
    }
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
          headerRight: () => (
            <Pressable
              onPress={handleShareTechnicalSheet}
              disabled={isSharing}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Compartir ficha técnica"
              style={{ padding: spacing.xs }}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color={colors.black} />
              ) : (
                <Ionicons name="share-outline" size={24} color={colors.black} />
              )}
            </Pressable>
          ),
        }}
      />

      <ProductDetail product={product} />
    </ScreenContainer>
  );
}

