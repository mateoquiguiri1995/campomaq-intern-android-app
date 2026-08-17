import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/theme/styles/app_quotes_summary';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getQuoteTotals, getLineTotal, getUnitPrice } from '@/features/quotes/services/quoteCalculations';
import { getClientDisplayName, getClientDisplaySubtitle } from '@/features/quotes/services/quoteClient';
import { shareQuotePdf } from '@/features/quotes/services/quotePdf';
import { deleteQuote } from '@/features/quotes/services/quoteService';
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
  const { client, items, status, loadDraft, updateItem, removeItem, saveDraft, markGenerated, duplicateQuote, resetBuilder } = useQuoteBuilder();

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
  const isEditable = status === 'Pendiente';

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
      // A quotation changes to Enviada only after the share action succeeds.
      const quote = await saveDraft();
      await shareQuotePdf(quote, session?.user ?? undefined);
      await markGenerated();
      router.replace('/reports');
    } catch (error) {
      Alert.alert('No se pudo generar el PDF', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  }

  function handleDuplicate() {
    duplicateQuote();
    router.replace('/quotes/summary');
  }

  function handleDelete() {
    Alert.alert('Eliminar borrador', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteQuote(draftId ?? '');
            resetBuilder();
            router.replace('/reports');
          } catch (error) {
            Alert.alert('No se pudo eliminar', error instanceof Error ? error.message : 'Intenta de nuevo.');
          }
        },
      },
    ]);
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

  function handleRemoveItem(item: QuoteItem) {
    Alert.alert('Eliminar producto', `¿Quieres quitar ${item.product.name} de la cotización?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeItem(item.product.id),
      },
    ]);
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
          disabled={!isEditable}
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
          {isEditable && <Ionicons name="chevron-forward" size={18} color="#8E8E93" />}
        </TouchableOpacity>

        {/* Sección de Productos */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>PRODUCTOS ({items.length})</Text>
          {isEditable && <TouchableOpacity
            style={styles.addProductsBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/quotes/select-products')}
          >
            <Ionicons name="add" size={16} color={colors.black} style={styles.addBtnIcon} />
            <Text style={styles.addProductsText}>Agregar</Text>
          </TouchableOpacity>}
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Aún no has añadido productos a esta cotización.</Text>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.product.id}
                style={styles.productCard}
                activeOpacity={isEditable ? 0.85 : 1}
                onPress={isEditable ? () => setEditingProduct(item.product) : undefined}
              >
                <View style={styles.productCardTop}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <View style={styles.productLineActions}>
                    <Text style={styles.productLineTotal}>
                      {formatCurrency(getLineTotal(item))}
                    </Text>
                    {isEditable && (
                      <TouchableOpacity
                        hitSlop={8}
                        onPress={(event) => {
                          event.stopPropagation();
                          handleRemoveItem(item);
                        }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.productCardBottom}>
                  <Text style={styles.productUnitSubtitle}>
                    {formatCurrency(getUnitPrice(item.product, item.priceTier))} c/u
                  </Text>
                  {isEditable && <View style={styles.counterRow}>
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
                  </View>}
                </View>

                {item.quantity > item.product.stockQty && (
                  <View style={styles.stockWarningTag}>
                    <Ionicons name="warning-outline" size={14} color={colors.danger} />
                    <Text style={styles.stockWarningText}>
                      Stock insuficiente: {item.product.stockQty} disponible
                    </Text>
                  </View>
                )}
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

      {isEditable ? (
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
      ) : (
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.btnSend} onPress={handleDuplicate}>
            <Text style={styles.btnSendText}>Duplicar cotización</Text>
          </TouchableOpacity>
        </View>
      )}

      {isEditable && draftId && (
        <View style={styles.draftActions}>
          <TouchableOpacity onPress={handleDuplicate}>
            <Text style={styles.duplicateDraftText}>Duplicar borrador</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteDraftText}>Eliminar borrador</Text>
          </TouchableOpacity>
        </View>
      )}

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

