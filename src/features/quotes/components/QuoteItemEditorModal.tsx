import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/common/Button';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
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

  const isStockUnknown = product?.stockQty === null || product?.stockQty === undefined;
  const hasNoStock = !isStockUnknown && (product?.stockQty ?? 0) <= 0;
  const limit = isStockUnknown ? 9999 : (product?.stockQty ?? 0);

  useEffect(() => {
    if (visible && product) {
      const defaultQty = hasNoStock ? '0' : '1';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity(String(initial?.quantity ?? defaultQty));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTier(initial?.priceTier ?? 'A');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiscount(initial?.discountPct ? String(initial.discountPct) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initial, product]);

  if (!product) return null;

  function adjustQuantity(delta: number) {
    if (hasNoStock) return;
    const current = Math.max(1, parseInt(quantity, 10) || 1);
    const next = Math.min(limit, Math.max(1, current + delta));
    setQuantity(String(next));
  }

  function handleQuantityChange(text: string) {
    if (hasNoStock) return;
    const cleaned = text.replace(/[^0-9]/g, '');
    const value = parseInt(cleaned, 10);

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
    if (hasNoStock) return;
    const qty = Math.min(limit, Math.max(1, parseInt(quantity, 10) || 1));
    const discountPct = discount.trim() ? Math.min(99, Math.max(0, parseFloat(discount))) : undefined;
    onConfirm({ quantity: qty, priceTier: tier, discountPct });
  }

  const getStockDisplayText = () => {
    if (isStockUnknown) return 'Desconocido';
    return String(product.stockQty);
  };

  const getStockLabelStyle = () => {
    if (isStockUnknown) return { color: colors.gray };
    return (product.stockQty ?? 0) > 0 ? styles.stockOk : styles.stockOut;
  };

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
            <Text style={[styles.stockLabel, getStockLabelStyle()]}>
              Stock disponible: {getStockDisplayText()}
            </Text>
          </View>
          <View style={styles.quantityRow}>
            <Pressable style={[styles.stepButton, hasNoStock && { opacity: 0.5 }]} onPress={() => adjustQuantity(-1)} disabled={hasNoStock}>
              <Text style={styles.stepButtonText}>−</Text>
            </Pressable>
            <TextInput
              style={[styles.quantityInput, hasNoStock && { backgroundColor: colors.background, color: colors.gray }]}
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              maxLength={4}
              editable={!hasNoStock}
            />
            <Pressable style={[styles.stepButton, hasNoStock && { opacity: 0.5 }]} onPress={() => adjustQuantity(1)} disabled={hasNoStock}>
              <Text style={styles.stepButtonText}>+</Text>
            </Pressable>
          </View>

          {hasNoStock && (
            <Text style={{ color: colors.danger, fontSize: 11, marginTop: 4, textAlign: 'center', fontWeight: '500' }}>
              Este producto no tiene stock disponible para cotizar.
            </Text>
          )}

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
              <Button
                label="Agregar a la cotización"
                onPress={handleConfirm}
                disabled={hasNoStock || !quantity || parseInt(quantity, 10) <= 0}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import { styles } from '@/theme/styles/src_features_quotes_components_QuoteItemEditorModal';
