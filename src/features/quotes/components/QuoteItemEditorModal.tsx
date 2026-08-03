import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

import { getUnitPrice } from '../services/quoteCalculations';
import type { PriceTier } from '../types';

const TIERS: { key: PriceTier; label: string }[] = [
  { key: 'A', label: 'Contado' },
  { key: 'B', label: 'Tarjeta' },
  { key: 'C', label: 'Crédito' },
];

interface QuoteItemValues {
  quantity: number;
  priceTier: PriceTier;
  discountPct?: number;
}

interface QuoteItemEditorModalProps {
  visible: boolean;
  product: Product | null;
  initial?: QuoteItemValues;
  onCancel: () => void;
  onConfirm: (values: QuoteItemValues) => void;
}

/** Modal para elegir cantidad, precio A/B/C y descuento antes de añadir/editar una línea. */
export function QuoteItemEditorModal({
  visible,
  product,
  initial,
  onCancel,
  onConfirm,
}: QuoteItemEditorModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [tier, setTier] = useState<PriceTier>('A');
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    if (visible) {
      setQuantity(String(initial?.quantity ?? 1));
      setTier(initial?.priceTier ?? 'A');
      setDiscount(initial?.discountPct ? String(initial.discountPct) : '');
    }
  }, [visible, initial]);

  if (!product) return null;

  function adjustQuantity(delta: number) {
    const current = Math.max(1, parseInt(quantity, 10) || 1);
    const next = Math.min(9999, Math.max(1, current + delta));
    setQuantity(String(next));
  }

  function handleQuantityChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '');
    const value = parseInt(cleaned, 10);
    if (cleaned === '') {
      setQuantity('');
    } else if (isNaN(value) || value < 1) {
      setQuantity('1');
    } else if (value > 9999) {
      setQuantity('9999');
    } else {
      setQuantity(cleaned);
    }
  }

  function handleDiscountChange(text: string) {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    if (cleaned === '' || cleaned === '.') {
      setDiscount(cleaned);
      return;
    }

    const value = parseFloat(cleaned);
    if (isNaN(value)) {
      setDiscount('');
    } else if (value > 99) {
      setDiscount('99');
    } else if (value < 0) {
      setDiscount('0');
    } else {
      if (cleaned.length > 1 && cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
        cleaned = cleaned.replace(/^0+/, '');
        if (cleaned === '') cleaned = '0';
      }
      setDiscount(cleaned);
    }
  }

  function handleConfirm() {
    // Aun sin existencias se puede generar la proforma; el PDF lo advertirá.
    const qty = Math.min(9999, Math.max(1, parseInt(quantity, 10) || 1));
    const discountPct = discount.trim() ? Math.min(99, Math.max(0, parseFloat(discount))) : undefined;
    onConfirm({ quantity: qty, priceTier: tier, discountPct });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCode}>Código: {product.code}</Text>

          <Text style={styles.sectionLabel}>Precio</Text>
          <View style={styles.tierRow}>
            {TIERS.map(({ key, label }) => (
              <Pressable
                key={key}
                style={[styles.tierChip, tier === key && styles.tierChipSelected]}
                onPress={() => setTier(key)}
              >
                <Text style={[styles.tierLabel, tier === key && styles.tierLabelSelected]}>{label}</Text>
                <Text style={[styles.tierPrice, tier === key && styles.tierLabelSelected]}>
                  {formatCurrency(getUnitPrice(product, key))}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>Cantidad</Text>
            <Text style={[
              styles.stockLabel,
              (product.stockQty ?? 0) > 0 ? styles.stockOk : styles.stockOut
            ]}>
              Stock disponible: {product.stockQty ?? 0}
            </Text>
          </View>
          <View style={styles.quantityRow}>
            <Pressable style={styles.stepButton} onPress={() => adjustQuantity(-1)}>
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Pressable style={styles.stepButton} onPress={() => adjustQuantity(1)}>
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Descuento (%, opcional)</Text>
          <TextInput
            style={styles.discountInput}
            value={discount}
            onChangeText={handleDiscountChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.gray}
            maxLength={5}
          />

          <View style={styles.actions}>
            <Button label="Cancelar" variant="ghost" onPress={onCancel} />
            <View style={styles.confirmButton}>
              <Button label="Agregar a la cotización" onPress={handleConfirm} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import { styles } from '@/theme/styles/src_features_quotes_components_QuoteItemEditorModal';
