import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getQuoteTotals, getLineTotal, getUnitPrice } from '@/features/quotes/services/quoteCalculations';
import { getClientDisplayName, getClientDisplaySubtitle } from '@/features/quotes/services/quoteClient';
import { shareQuotePdf } from '@/features/quotes/services/quotePdf';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';
import type { QuoteItem } from '@/features/quotes/types';

export default function QuoteSummaryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { draftId } = useLocalSearchParams<{ draftId?: string }>();
  const { client, items, loadDraft, updateItem, removeItem, saveDraft, markGenerated } = useQuoteBuilder();

  const [hydrating, setHydrating] = useState(!!draftId);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    loadDraft(draftId).finally(() => setHydrating(false));
  }, [draftId, loadDraft]);

  const totals = getQuoteTotals(items);
  const editingItem = editingProduct ? items.find((item) => item.product.id === editingProduct.id) : undefined;

  async function handleSaveDraft() {
    try {
      setSavingDraft(true);
      await saveDraft();
      router.replace('/reports');
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleGenerateAndShare() {
    try {
      setGenerating(true);
      const quote = await markGenerated();
      await shareQuotePdf(quote, session?.user ?? undefined);
      router.replace('/reports');
    } catch (error) {
      Alert.alert('No se pudo generar el PDF', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  }

  function handleDecreaseQty(item: QuoteItem) {
    if (item.quantity > 1) {
      updateItem(item.product.id, { quantity: item.quantity - 1 });
    } else {
      Alert.alert(
        'Quitar producto',
        '¿Quieres quitar este producto de la cotización?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Quitar', style: 'destructive', onPress: () => removeItem(item.product.id) }
        ]
      );
    }
  }

  const getClientInitials = () => {
    if (!client) return 'CF';
    const name = getClientDisplayName(client);
    const parts = name.split(' ');
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[1]?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || 'CF';
  };

  if (hydrating) {
    return (
      <ScreenContainer scroll={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!client) {
    return (
      <ScreenContainer scroll={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No hay un cliente seleccionado. Vuelve a Reportes y empieza una nueva cotización.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const clientSubtitle = getClientDisplaySubtitle(client);

  return (
    <ScreenContainer scroll={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Cabecera Personalizada */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{draftId ? 'Detalle de cotización' : 'Nueva cotización'}</Text>
        <TouchableOpacity onPress={() => router.replace('/reports')} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Contenido Scrollable */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Cliente */}
        <Text style={styles.sectionTitle}>CLIENTE</Text>
        <TouchableOpacity
          style={styles.clientCard}
          activeOpacity={0.8}
          onPress={() => router.push('/quotes/select-client')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getClientInitials()}</Text>
          </View>
          <View style={styles.clientText}>
            <Text style={styles.clientName} numberOfLines={1}>
              {getClientDisplayName(client)}
            </Text>
            {clientSubtitle ? (
              <Text style={styles.clientSubtitle} numberOfLines={1}>
                {clientSubtitle}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
        </TouchableOpacity>

        {/* Sección de Productos */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>PRODUCTOS ({items.length})</Text>
          <TouchableOpacity
            style={styles.addProductsBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/quotes/select-products')}
          >
            <Ionicons name="add" size={16} color={colors.black} style={styles.addBtnIcon} />
            <Text style={styles.addProductsText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Aún no has añadido productos a esta cotización.</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.product.id}
                style={styles.productCard}
                activeOpacity={0.85}
                onPress={() => setEditingProduct(item.product)}
              >
                <View style={styles.productCardTop}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.productLineTotal}>
                    {formatCurrency(getLineTotal(item))}
                  </Text>
                </View>

                <View style={styles.productCardBottom}>
                  <Text style={styles.productUnitSubtitle}>
                    {formatCurrency(getUnitPrice(item.product, item.priceTier))} c/u
                  </Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={styles.counterBtnMinus}
                      activeOpacity={0.7}
                      onPress={() => handleDecreaseQty(item)}
                    >
                      <Ionicons name="remove" size={14} color="#666666" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.counterBtnPlus}
                      activeOpacity={0.7}
                      onPress={() => updateItem(item.product.id, { quantity: item.quantity + 1 })}
                    >
                      <Ionicons name="add" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Totales */}
        {items.length > 0 && (
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IVA (15%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(totals.iva)}</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={[styles.totalsRow, styles.totalsRowFinal]}>
              <Text style={styles.totalLabelFinal}>Total</Text>
              <Text style={styles.totalValueFinal}>{formatCurrency(totals.total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botonera Inferior Fija */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.btnDraft, (items.length === 0 || savingDraft || generating) && styles.btnDisabled]}
          onPress={handleSaveDraft}
          disabled={items.length === 0 || savingDraft || generating}
        >
          <Text style={styles.btnDraftText}>{savingDraft ? 'Guardando…' : 'Guardar borrador'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSend, (items.length === 0 || generating || savingDraft) && styles.btnDisabled]}
          onPress={handleGenerateAndShare}
          disabled={items.length === 0 || generating || savingDraft}
        >
          <Text style={styles.btnSendText}>{generating ? 'Enviando…' : 'Enviar cotización'}</Text>
        </TouchableOpacity>
      </View>

      <QuoteItemEditorModal
        visible={!!editingProduct}
        product={editingProduct}
        initial={editingItem}
        onCancel={() => setEditingProduct(null)}
        onConfirm={(values) => {
          if (editingProduct) updateItem(editingProduct.id, values);
          setEditingProduct(null);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.grayDark,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grayDark,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary, // Borde amarillo Campo Maq
    padding: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  clientText: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  clientSubtitle: {
    fontSize: 12,
    color: colors.grayDark,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.sm,
  },
  addBtnIcon: {
    fontWeight: '700',
  },
  addProductsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  itemsList: {
    gap: spacing.sm,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  productCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    paddingRight: spacing.sm,
  },
  productLineTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  productCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productUnitSubtitle: {
    fontSize: 12,
    color: colors.grayDark,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtnMinus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  counterBtnPlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalsRowFinal: {
    marginTop: spacing.xs,
  },
  totalsDivider: {
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    marginVertical: spacing.xs,
  },
  totalsLabel: {
    fontSize: 13,
    color: colors.grayDark,
  },
  totalsValue: {
    fontSize: 13,
    color: colors.black,
  },
  totalLabelFinal: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '700',
  },
  totalValueFinal: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '700',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btnDraft: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDraftText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  btnSend: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSendText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
