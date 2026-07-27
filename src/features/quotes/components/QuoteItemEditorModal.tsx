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
    const maxStock = product?.stockQty ?? 0;
    const limit = maxStock > 0 ? maxStock : 9999;
    let next = Math.min(limit, Math.max(1, current + delta));
    setQuantity(String(next));
  }

  function handleQuantityChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '');
    const value = parseInt(cleaned, 10);
    const maxStock = product?.stockQty ?? 0;
    const limit = maxStock > 0 ? maxStock : 9999;

    if (cleaned === '') {
      setQuantity('');
    } else if (isNaN(value) || value < 1) {
      setQuantity('1');
    } else if (value > limit) {
      setQuantity(String(limit));
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
    const maxStock = product?.stockQty ?? 0;
    const limit = maxStock > 0 ? maxStock : 9999;
    const qty = Math.min(limit, Math.max(1, parseInt(quantity, 10) || 1));
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  productName: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  productCode: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.grayDark,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockOk: {
    color: colors.success,
  },
  stockOut: {
    color: colors.danger,
  },
  tierRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tierChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tierChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tierLabel: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
  },
  tierLabelSelected: {
    color: colors.onPrimary,
  },
  tierPrice: {
    ...typography.body,
    color: colors.black,
    fontWeight: '700',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  quantityInput: {
    ...typography.subtitle,
    color: colors.black,
    width: 70,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  discountInput: {
    ...typography.body,
    color: colors.black,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
});
