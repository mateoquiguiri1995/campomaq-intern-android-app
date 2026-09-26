import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/Button';
import { useKeyboardOverlap } from '@/hooks/useKeyboardOverlap';
import type { Product } from '@/features/catalog/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { styles } from '@/theme/styles/src_features_quotes_components_QuoteItemEditorModal';
import { formatCurrency } from '@/utils/currency';

import { getUnitPrice, getUtilityPct, round2 } from '../services/quoteCalculations';
import type { PriceTier } from '../types';

const TIERS: { key: PriceTier; label: string }[] = [
  { key: 'A', label: 'Contado' },
  { key: 'B', label: 'Tarjeta' },
  { key: 'C', label: 'Crédito' },
];

type DiscountMode = 'pct' | 'amount';

/** Secciones con campos de texto: al enfocarlas se desplaza el scroll hasta ellas. */
type EditorSection = 'price' | 'quantity' | 'discount';

interface QuoteItemValues {
  quantity: number;
  priceTier: PriceTier;
  customPrice?: number;
  discountPct?: number;
  discountAmount?: number;
}

interface QuoteItemEditorModalProps {
  visible: boolean;
  product: Product | null;
  initial?: QuoteItemValues;
  onCancel: () => void;
  onConfirm: (values: QuoteItemValues) => void;
}

/** Modal para elegir cantidad, precio A/B/C o personalizado y descuento antes de añadir/editar una línea. */
export function QuoteItemEditorModal({
  visible,
  product,
  initial,
  onCancel,
  onConfirm,
}: QuoteItemEditorModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [tier, setTier] = useState<PriceTier>('A');
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [discountMode, setDiscountMode] = useState<DiscountMode>('pct');
  const [discount, setDiscount] = useState('');

  const insets = useSafeAreaInsets();
  const {
    rootRef: modalRootRef,
    onRootLayout: handleModalRootLayout,
    overlap: keyboardOverlap,
    keyboardVisible,
    rootHeight: modalRootHeight,
  } = useKeyboardOverlap();
  const scrollRef = useRef<ScrollView>(null);
  const [sectionOffsets, setSectionOffsets] = useState<Partial<Record<EditorSection, number>>>({});
  const [focusedSection, setFocusedSection] = useState<EditorSection | null>(null);

  // Con el teclado abierto, lleva a la vista la sección del campo enfocado
  // (cantidad y descuento quedan al final del formulario).
  useEffect(() => {
    if (!keyboardVisible || !focusedSection) return;
    const y = sectionOffsets[focusedSection];
    if (y == null) return;
    const handle = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
    }, 60);
    return () => clearTimeout(handle);
  }, [keyboardVisible, keyboardOverlap, focusedSection, sectionOffsets]);

  function registerSection(section: EditorSection) {
    return (event: { nativeEvent: { layout: { y: number } } }) => {
      const { y } = event.nativeEvent.layout;
      setSectionOffsets((prev) => (prev[section] === y ? prev : { ...prev, [section]: y }));
    };
  }

  function focusSection(section: EditorSection) {
    return () => setFocusedSection(section);
  }

  useEffect(() => {
    if (visible) {
      setQuantity(String(initial?.quantity ?? 1));
      const initialTier = initial?.priceTier ?? 'A';
      setTier(initialTier);
      if (initial?.customPrice != null) {
        setCustomPriceInput(String(initial.customPrice));
      } else if (product) {
        setCustomPriceInput(String(getUnitPrice(product, 'A')));
      } else {
        setCustomPriceInput('');
      }
      if (initial?.discountAmount) {
        setDiscountMode('amount');
        setDiscount(String(initial.discountAmount));
      } else if (initial?.discountPct) {
        setDiscountMode('pct');
        setDiscount(String(initial.discountPct));
      } else {
        setDiscountMode('pct');
        setDiscount('');
      }
    }
  }, [visible, initial, product]);

  if (!product) return null;

  // Alto disponible para el sheet: pantalla menos teclado y barra de estado.
  const sheetMaxHeight =
    modalRootHeight != null
      ? Math.max(260, modalRootHeight - keyboardOverlap - insets.top - spacing.sm)
      : undefined;

  const parsedCustomPrice = parseFloat(customPriceInput.trim());
  const validCustomPrice =
    !isNaN(parsedCustomPrice) && parsedCustomPrice > 0 ? round2(parsedCustomPrice) : undefined;

  const selectedQuantity = parseInt(quantity, 10) || 0;
  const hasSufficientStock = selectedQuantity <= product.stockQty;
  const effectiveQuantity = Math.max(1, selectedQuantity || 1);

  // Precio unitario base de la línea
  const currentBasePrice =
    tier === 'CUSTOM'
      ? (validCustomPrice ?? 0)
      : getUnitPrice(product, tier);

  const lineSubtotal = round2(currentBasePrice * effectiveQuantity);
  const numericDiscount = discount.trim() && discount !== '.' ? parseFloat(discount) : 0;
  const discountAmountPreview =
    discountMode === 'pct'
      ? round2((lineSubtotal * Math.min(100, Math.max(0, numericDiscount))) / 100)
      : round2(Math.min(lineSubtotal, Math.max(0, numericDiscount)));

  const lineTotal = round2(Math.max(0, lineSubtotal - discountAmountPreview));

  // Utilidad real de la línea: precio neto por unidad (con descuento) vs último costo
  const netUnitPrice = round2(lineTotal / effectiveQuantity);
  const utilityPct = getUtilityPct(netUnitPrice, product.lastCost);

  // Validaciones de restricción: límite en last_cost
  const hasCost = product.lastCost != null && product.lastCost > 0;
  const isCustomPriceEmpty = tier === 'CUSTOM' && (validCustomPrice == null || validCustomPrice <= 0);
  const isBaseBelowCost =
    tier === 'CUSTOM' && hasCost && (validCustomPrice == null || validCustomPrice < product.lastCost!);
  const isNetBelowCost = hasCost && netUnitPrice < product.lastCost!;

  const hasRestrictionViolation = isCustomPriceEmpty || isBaseBelowCost || isNetBelowCost;

  let restrictionErrorMessage: string | null = null;
  if (tier === 'CUSTOM' && isCustomPriceEmpty) {
    restrictionErrorMessage = 'Ingresa un precio unitario mayor a 0.';
  } else if (isBaseBelowCost) {
    restrictionErrorMessage = `El precio no puede ser inferior al costo (${formatCurrency(product.lastCost!)}).`;
  } else if (isNetBelowCost) {
    restrictionErrorMessage = `El precio neto con descuento (${formatCurrency(netUnitPrice)}) queda por debajo del costo (${formatCurrency(product.lastCost!)}).`;
  }

  function getUtilityBadgeStyle(pct: number | null, isSelected = false) {
    if (pct == null) return styles.utilityBadgeNeutral;
    if (isSelected) return styles.tierUtilityPillSelected;
    if (pct <= 10) return styles.utilityBadgeRed;
    if (pct <= 30) return styles.utilityBadgeOrange;
    return styles.utilityBadgeGreen;
  }

  function getUtilityTextStyle(pct: number | null, isSelected = false) {
    if (isSelected) return styles.tierLabelSelected;
    if (pct == null) return styles.utilityTextNeutral;
    if (pct <= 10) return styles.utilityTextRed;
    if (pct <= 30) return styles.utilityTextOrange;
    return styles.utilityTextGreen;
  }

  function getUtilityIcon(pct: number | null): keyof typeof Ionicons.glyphMap {
    if (pct == null) return 'help-circle-outline';
    if (pct <= 10) return 'trending-down';
    return 'trending-up';
  }

  function getUtilityIconColor(pct: number | null) {
    if (pct == null) return colors.gray;
    if (pct <= 10) return colors.danger;
    if (pct <= 30) return colors.orange;
    return colors.success;
  }

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

  /** Normaliza el texto tipeado a un número con como máximo `maxIntDigits` dígitos enteros y 2 decimales. */
  function cleanDecimalInput(text: string, maxIntDigits: number): string {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    const match = cleaned.match(new RegExp(`^\\d{0,${maxIntDigits}}(\\.\\d{0,2})?`));
    cleaned = match ? match[0] : '';

    if (cleaned.length > 1 && cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
      cleaned = cleaned.replace(/^0+/, '') || '0';
    }
    return cleaned;
  }

  function handleDiscountPctChange(text: string) {
    const cleaned = cleanDecimalInput(text, 2);
    if (cleaned === '' || cleaned === '.') {
      setDiscount(cleaned);
      return;
    }
    const value = parseFloat(cleaned);
    if (isNaN(value)) {
      setDiscount('');
    } else if (value > 99) {
      setDiscount('99');
    } else {
      setDiscount(cleaned);
    }
  }

  function handleDiscountAmountChange(text: string) {
    const cleaned = cleanDecimalInput(text, 6);
    if (cleaned === '' || cleaned === '.') {
      setDiscount(cleaned);
      return;
    }
    const value = parseFloat(cleaned);
    if (isNaN(value)) {
      setDiscount('');
    } else if (lineSubtotal > 0 && value > lineSubtotal) {
      setDiscount(String(lineSubtotal));
    } else {
      setDiscount(cleaned);
    }
  }

  function handleDiscountModeChange(mode: DiscountMode) {
    if (mode === discountMode) return;
    setDiscountMode(mode);
    setDiscount('');
  }

  function handleConfirm() {
    if (hasRestrictionViolation) return;

    const qty = Math.min(9999, Math.max(1, parseInt(quantity, 10) || 1));
    const hasDiscount = discount.trim() !== '' && discount.trim() !== '.';
    const numericValue = hasDiscount ? parseFloat(discount) : 0;

    const discountPct =
      discountMode === 'pct' && hasDiscount && numericValue > 0
        ? Math.min(100, Math.max(0, numericValue))
        : undefined;
    const discountAmount =
      discountMode === 'amount' && hasDiscount && numericValue > 0
        ? round2(Math.min(lineSubtotal, Math.max(0, numericValue)))
        : undefined;

    const customPrice = tier === 'CUSTOM' ? validCustomPrice : undefined;

    onConfirm({
      quantity: qty,
      priceTier: tier,
      customPrice,
      discountPct,
      discountAmount,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View
        ref={modalRootRef}
        onLayout={handleModalRootLayout}
        style={[styles.modalRoot, Platform.OS === 'android' && { paddingBottom: keyboardOverlap }]}
      >
        {/* Punto A: Fondo oscuro fijo al 100% que nunca se corta ni salta */}
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          {/* Usamos View (no Pressable) para no bloquear los gestos de ScrollView en Android */}
          <View style={[styles.sheet, sheetMaxHeight != null && { maxHeight: sheetMaxHeight }]}>
            <View style={styles.handle} />

            {/* Cabecera del producto */}
            <View style={styles.header}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productMeta}>
                Código: {product.code} · {product.iva ? 'IVA 15%' : 'IVA 0%'}
              </Text>
            </View>

            {/* Área scrolleable: Controles de edición */}
            <ScrollView
              ref={scrollRef}
              style={[styles.scrollArea, keyboardVisible && styles.scrollAreaWithKeyboard]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {/* Sección Precio */}
              <View style={styles.section} onLayout={registerSection('price')}>
                <View style={styles.labelRow}>
                  <Text style={styles.sectionLabel}>Tipo de precio</Text>
                  {product.lastCost != null && (
                    <Text style={styles.customPriceCostHint}>
                      Costo límite: {formatCurrency(product.lastCost)}
                    </Text>
                  )}
                </View>

                {/* Chips de listas estándar A, B, C */}
                <View style={styles.tierRow}>
                  {TIERS.map(({ key, label }) => {
                    const tierUnitPrice = getUnitPrice(product, key);
                    const tierUtilityPct = getUtilityPct(tierUnitPrice, product.lastCost);
                    const isSelected = tier === key;
                    return (
                      <Pressable
                        key={key}
                        style={[styles.tierChip, isSelected && styles.tierChipSelected]}
                        onPress={() => setTier(key)}
                      >
                        <Text style={[styles.tierLabel, isSelected && styles.tierLabelSelected]}>
                          {label}
                        </Text>
                        <Text style={[styles.tierPrice, isSelected && styles.tierLabelSelected]}>
                          {formatCurrency(tierUnitPrice)}
                        </Text>
                        {tierUtilityPct != null && (
                          <View
                            style={[
                              styles.tierUtilityPill,
                              getUtilityBadgeStyle(tierUtilityPct, isSelected),
                            ]}
                          >
                            <Text
                              style={[
                                styles.tierUtilityText,
                                getUtilityTextStyle(tierUtilityPct, isSelected),
                              ]}
                            >
                              {tierUtilityPct.toFixed(1)}%
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Punto C: Acordeón para Precio Personalizado con amarillo Campo Maq */}
                <View style={[styles.customTierCard, tier === 'CUSTOM' && styles.customTierCardSelected]}>
                  <Pressable
                    style={[styles.customTierHeader, tier === 'CUSTOM' && styles.customTierHeaderSelected]}
                    onPress={() => {
                      if (tier !== 'CUSTOM') {
                        setTier('CUSTOM');
                        if (!customPriceInput || customPriceInput === '0') {
                          setCustomPriceInput(String(getUnitPrice(product, 'A')));
                        }
                      }
                    }}
                  >
                    <View style={styles.customTierLeft}>
                      <Ionicons
                        name={tier === 'CUSTOM' ? 'create' : 'create-outline'}
                        size={17}
                        color={tier === 'CUSTOM' ? colors.onPrimary : colors.black}
                      />
                      <Text
                        style={[
                          styles.customTierTitle,
                          tier === 'CUSTOM' && styles.customTierTitleSelected,
                        ]}
                      >
                        Personalizar precio
                      </Text>
                    </View>

                    <View style={styles.customTierRight}>
                      {tier === 'CUSTOM' && validCustomPrice != null ? (
                        <>
                          <Text style={[styles.customTierPrice, styles.customTierTitleSelected]}>
                            {formatCurrency(validCustomPrice)}
                          </Text>
                          {utilityPct != null && (
                            <View style={[styles.tierUtilityPill, styles.tierUtilityPillSelected]}>
                              <Text style={[styles.tierUtilityText, styles.tierLabelSelected]}>
                                {utilityPct.toFixed(1)}%
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <Text style={styles.customTierActionText}>Ingresar valor</Text>
                      )}
                    </View>
                  </Pressable>

                  {/* Campo numérico desplegado suavemente cuando Personalizado está activo */}
                  {tier === 'CUSTOM' && (
                    <View style={styles.customPriceExpandedArea}>
                      <View style={[styles.discountFieldRow, isBaseBelowCost && styles.fieldRowError]}>
                        <Text style={styles.discountFieldSymbol}>$</Text>
                        <TextInput
                          style={styles.discountFieldInput}
                          value={customPriceInput}
                          onChangeText={(text) => setCustomPriceInput(cleanDecimalInput(text, 6))}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={colors.gray}
                          maxLength={9}
                          onFocus={focusSection('price')}
                          autoFocus={!initial?.customPrice}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Alerta de restricción si se viola el límite de costo */}
                {restrictionErrorMessage && (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle" size={15} color={colors.danger} />
                    <Text style={styles.errorAlertText}>{restrictionErrorMessage}</Text>
                  </View>
                )}

                {/* Cajoncitos para último costo y costo promedio */}
                {(product.lastCost != null || product.averageCost != null) && (
                  <View style={styles.costInfoRow}>
                    {product.lastCost != null && (
                      <View style={styles.costPill}>
                        <Text style={styles.costPillLabel}>Últ. costo</Text>
                        <Text style={styles.costPillValue}>{formatCurrency(product.lastCost)}</Text>
                      </View>
                    )}
                    {product.averageCost != null && (
                      <View style={styles.costPill}>
                        <Text style={styles.costPillLabel}>Costo prom.</Text>
                        <Text style={styles.costPillValue}>{formatCurrency(product.averageCost)}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Sección Cantidad */}
              <View style={styles.section} onLayout={registerSection('quantity')}>
                <View style={styles.labelRow}>
                  <Text style={styles.sectionLabel}>Cantidad</Text>
                  <Text
                    style={[
                      styles.stockLabel,
                      hasSufficientStock ? styles.stockOk : styles.stockOut,
                    ]}
                  >
                    {hasSufficientStock
                      ? `Stock disponible: ${product.stockQty}`
                      : `Stock insuficiente: ${product.stockQty} disp.`}
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
                    onFocus={focusSection('quantity')}
                  />
                  <Pressable style={styles.stepButton} onPress={() => adjustQuantity(1)}>
                    <Text style={styles.stepButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>

              {/* Sección Descuento */}
              <View style={styles.section} onLayout={registerSection('discount')}>
                <View style={styles.labelRow}>
                  <Text style={styles.sectionLabel}>Descuento (opcional)</Text>
                  <View style={styles.discountModeToggle}>
                    <Pressable
                      style={[
                        styles.discountModeSegment,
                        discountMode === 'pct' && styles.discountModeSegmentSelected,
                      ]}
                      onPress={() => handleDiscountModeChange('pct')}
                      hitSlop={4}
                    >
                      <Text
                        style={[
                          styles.discountModeSegmentText,
                          discountMode === 'pct' && styles.discountModeSegmentTextSelected,
                        ]}
                      >
                        %
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.discountModeSegment,
                        discountMode === 'amount' && styles.discountModeSegmentSelected,
                      ]}
                      onPress={() => handleDiscountModeChange('amount')}
                      hitSlop={4}
                    >
                      <Text
                        style={[
                          styles.discountModeSegmentText,
                          discountMode === 'amount' && styles.discountModeSegmentTextSelected,
                        ]}
                      >
                        $
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.discountFieldRow}>
                  {discountMode === 'amount' && <Text style={styles.discountFieldSymbol}>$</Text>}
                  <TextInput
                    style={styles.discountFieldInput}
                    value={discount}
                    onChangeText={discountMode === 'pct' ? handleDiscountPctChange : handleDiscountAmountChange}
                    keyboardType="decimal-pad"
                    placeholder={discountMode === 'pct' ? '0' : '0.00'}
                    placeholderTextColor={colors.gray}
                    maxLength={discountMode === 'pct' ? 5 : 9}
                    onFocus={focusSection('discount')}
                  />
                  {discountMode === 'pct' && <Text style={styles.discountFieldSymbol}>%</Text>}
                </View>
              </View>
            </ScrollView>

            {/* Punto B: Footer Sticky con Resumen en Vivo + Botones */}
            <View
              style={[
                styles.stickyFooter,
                // Sin teclado, el footer no debe quedar bajo la barra de navegación.
                !keyboardVisible && { paddingBottom: styles.stickyFooter.paddingBottom + insets.bottom },
              ]}
            >
              <View style={styles.stickySummaryCard}>
                <View style={styles.stickySummaryLeft}>
                  <Text style={styles.stickySummaryLabel}>TOTAL LÍNEA</Text>
                  <View style={styles.stickySummaryPriceRow}>
                    <Text style={styles.stickySummaryTotal}>{formatCurrency(lineTotal)}</Text>
                    {discountAmountPreview > 0 && (
                      <Text style={styles.stickySummaryDiscount}>
                        (−{formatCurrency(discountAmountPreview)})
                      </Text>
                    )}
                  </View>
                </View>

                {utilityPct != null && (
                  <View style={[styles.utilityBadge, getUtilityBadgeStyle(utilityPct, false)]}>
                    <Ionicons
                      name={getUtilityIcon(utilityPct)}
                      size={13}
                      color={getUtilityIconColor(utilityPct)}
                    />
                    <Text style={[styles.utilityBadgePct, getUtilityTextStyle(utilityPct, false)]}>
                      {utilityPct.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actions}>
                <Button label="Cancelar" variant="ghost" onPress={onCancel} />
                <View style={styles.confirmButton}>
                  <Button
                    label={initial ? 'Guardar cambios' : 'Agregar a la cotización'}
                    onPress={handleConfirm}
                    disabled={hasRestrictionViolation}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
