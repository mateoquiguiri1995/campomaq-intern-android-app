import { StyleSheet, Text, View } from 'react-native';
import { styles } from '@/theme/styles/src_features_catalog_components_ProductDetail_ProductPriceList';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

import type { Product } from '../../types';

interface ProductPriceListProps {
  product: Product;
}

const TIERS: {
  key: 'priceA' | 'priceB' | 'priceC';
  label: string;
  hint: string;
}[] = [
  { key: 'priceA', label: 'Contado', hint: 'Precio de contado' },
  { key: 'priceB', label: 'Tarjeta', hint: 'Precio con tarjeta' },
  { key: 'priceC', label: 'Crédito', hint: 'Precio a crédito' },
];

/** Lista de precios A/B/C del producto. */
export function ProductPriceList({ product }: ProductPriceListProps) {
  return (
    <View style={styles.container}>
      {TIERS.map(({ key, label, hint }, index) => (
        <View
          key={key}
          style={[styles.row, index === 0 && styles.rowFirst]}
        >
          <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.hint}>{hint}</Text>
          </View>

          <Text style={styles.price}>{formatCurrency(product[key])}</Text>
        </View>
      ))}

      {product.marginPct != null && (
        <View style={styles.marginRow}>
          <Text style={styles.marginText}>
            Margen: {product.marginPct}%
          </Text>
        </View>
      )}
    </View>
  );
}

