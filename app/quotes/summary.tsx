import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { QuoteTermsModal } from '@/features/quotes/components/QuoteTermsModal';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getLineDiscount, getLineTotal, getQuoteTotals, getUnitPrice, getUnitPriceNet, getUtilityLevel, getUtilityPct, round2 } from '@/features/quotes/services/quoteCalculations';
import { getClientDisplayName, getClientDisplaySubtitle } from '@/features/quotes/services/quoteClient';
import { getQuoteCode } from '@/features/quotes/services/quoteCode';
import { shareQuotePdf } from '@/features/quotes/services/quotePdf';
import { deleteQuote } from '@/features/quotes/services/quoteService';
import type { PriceTier, Quote, QuoteItem, QuoteSellerInfo } from '@/features/quotes/types';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/app_quotes_summary';
import { formatCurrency } from '@/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  A: 'Precio A · Contado',
  B: 'Precio B · Tarjeta',
  C: 'Precio C · Crédito',
  CUSTOM: 'Personalizado',
};

export default function QuoteSummaryScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { draftId } = useLocalSearchParams<{ draftId?: string }>();
  const { id, client, items, status, observations, termsAndConditions, seller, duplicatedFrom, createdAt, loadDraft, updateItem, removeItem, saveDraft, markGenerated, duplicateQuote, resetBuilder } = useQuoteBuilder();

  const [hydrating, setHydrating] = useState(!!draftId);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resharing, setResharing] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    loadDraft(draftId)
      .catch(() => {
        Alert.alert('No se pudo abrir la cotización', 'Intenta de nuevo desde Reportes.');
      })
      .finally(() => setHydrating(false));
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

  function handleOpenTermsModal() {
    setTermsModalVisible(true);
  }

  async function handleConfirmTermsAndSend(values: {
    termsAndConditions: string;
    observations: string;
    seller: QuoteSellerInfo;
  }) {
    let draftSaved = false;
    try {
      setGenerating(true);
      setTermsModalVisible(false);
      const quote = await saveDraft(values);
      draftSaved = true;
      // Nota: expo-sharing resuelve esta promesa en cuanto se abre el selector
      // de apps, no cuando el usuario efectivamente comparte — no hay forma
      // confiable de distinguir "compartido" de "panel cerrado sin elegir
      // nada". Por eso el botón "Reenviar PDF" (más abajo, para cotizaciones
      // ya no editables) sigue disponible después de esto.
      await shareQuotePdf(quote);
      await markGenerated(values);
      router.replace('/reports');
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Intenta de nuevo.';
      if (draftSaved) {
        Alert.alert(
          'Borrador guardado',
          `El borrador se guardó correctamente, pero no se pudo generar/compartir el PDF (${reason}). Puedes reintentar el envío.`
        );
      } else {
        Alert.alert('No se pudo generar el PDF', reason);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleResharePdf() {
    if (!client) return;
    try {
      setResharing(true);
      const quote: Quote = {
        id,
        client,
        items,
        status,
        observations: observations.trim() || undefined,
        termsAndConditions: termsAndConditions.trim() || undefined,
        seller: seller ?? undefined,
        createdAt,
        updatedAt: new Date().toISOString(),
      };
      await shareQuotePdf(quote);
    } catch (error) {
      Alert.alert('No se pudo compartir el PDF', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setResharing(false);
    }
  }

  async function handleDuplicate() {
    try {
      const newId = await duplicateQuote();
      // Se abre por su id para que se trate como cotización guardada (eliminar, etc.).
      router.replace({ pathname: '/quotes/summary', params: { draftId: newId } });
    } catch (error) {
      Alert.alert('No se pudo duplicar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    }
  }

  async function deleteCurrentDraft() {
    try {
      if (!session?.user.id || !draftId) return;
      await deleteQuote(session.user.id, draftId);
      resetBuilder();
      router.replace('/reports');
    } catch (error) {
      Alert.alert('No se pudo eliminar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    }
  }

  function handleDelete() {
    Alert.alert('Eliminar borrador', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: deleteCurrentDraft },
    ]);
  }

  /**
   * Quitar el último producto de una cotización guardada la deja vacía: se
   * ofrece eliminarla o guardarla sin productos, para que al salir no
   * reaparezca con los productos que ya se habían quitado.
   */
  async function keepEmptyDraft(item: QuoteItem) {
    removeItem(item.product.id);
    try {
      await saveDraft({ items: [] });
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    }
  }

  function requestRemoveItem(item: QuoteItem, title: string, message: string) {
    if (draftId && items.length === 1) {
      Alert.alert(
        'Cotización sin productos',
        'Estás quitando el último producto. ¿Quieres eliminar esta cotización guardada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Mantener vacía', onPress: () => keepEmptyDraft(item) },
          { text: 'Eliminar', style: 'destructive', onPress: deleteCurrentDraft },
        ]
      );
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => removeItem(item.product.id) },
    ]);
  }

  function handleDecreaseQty(item: QuoteItem) {
    if (item.quantity > 1) {
      updateItem(item.product.id, { quantity: item.quantity - 1 });
    } else {
      requestRemoveItem(item, 'Quitar producto', '¿Quieres quitar este producto de la cotización?');
    }
  }

  function handleRemoveItem(item: QuoteItem) {
    requestRemoveItem(item, 'Eliminar producto', `¿Quieres quitar ${item.product.name} de la cotización?`);
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

      {draftId && (
        <View style={styles.quoteCodeRow}>
          <Text style={styles.quoteCodeText}>{getQuoteCode(id)}</Text>
          {duplicatedFrom && (
            <View style={styles.copyBadge}>
              <Ionicons name="copy-outline" size={12} color={colors.grayDark} />
              <Text style={styles.copyBadgeText}>Copia de {getQuoteCode(duplicatedFrom)}</Text>
            </View>
          )}
        </View>
      )}

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
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.productUnitSubtitle}>
                      {item.product.iva
                        ? `${formatCurrency(getUnitPriceNet(item))} c/u sin IVA`
                        : `${formatCurrency(getUnitPrice(item.product, item.priceTier, item.customPrice))} c/u · Sin IVA`}
                      {item.discountAmount
                        ? ` · Desc. ${formatCurrency(getLineDiscount(item))}`
                        : item.discountPct
                          ? ` · Desc. ${item.discountPct}%`
                          : ''}
                    </Text>
                    
                    {(() => {
                      const lineTot = getLineTotal(item);
                      const netUnit = round2(lineTot / Math.max(1, item.quantity));
                      const utPct = getUtilityPct(netUnit, item.product.lastCost);
                      const lvl = utPct == null ? null : getUtilityLevel(utPct);
                      const isLow = lvl === 'low';
                      const isMed = lvl === 'medium';
                      const isCustom = item.priceTier === 'CUSTOM';
                      return (
                        <View style={styles.productBadgesRow}>
                          <View style={[styles.tierBadge, isCustom && styles.tierBadgeCustom]}>
                            <Ionicons
                              name={isCustom ? 'create-outline' : 'pricetag-outline'}
                              size={11}
                              color={isCustom ? colors.primaryDark : colors.grayDark}
                            />
                            <Text style={[styles.tierBadgeText, isCustom && styles.tierBadgeTextCustom]}>
                              {PRICE_TIER_LABELS[item.priceTier]}
                            </Text>
                          </View>
                          {utPct != null && <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 3,
                              paddingHorizontal: 6,
                              paddingVertical: 1.5,
                              borderRadius: 10,
                              backgroundColor: isLow
                                ? 'rgba(214, 69, 69, 0.12)'
                                : isMed
                                  ? 'rgba(230, 126, 34, 0.12)'
                                  : 'rgba(46, 158, 79, 0.12)',
                            }}
                          >
                            <Ionicons
                              name={isLow ? 'trending-down' : 'trending-up'}
                              size={11}
                              color={isLow ? colors.danger : isMed ? colors.orange : colors.success}
                            />
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: isLow ? colors.danger : isMed ? colors.orange : colors.success,
                              }}
                            >
                              Utilidad {utPct.toFixed(1)}%
                            </Text>
                          </View>}
                        </View>
                      );
                    })()}
                  </View>
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
                      onPress={() => updateItem(item.product.id, { quantity: Math.min(9999, item.quantity + 1) })}
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
            {totals.subtotal0 > 0 ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal 15%</Text>
                  <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal15)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal 0%</Text>
                  <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal0)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal)}</Text>
              </View>
            )}
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
          onPress={handleOpenTermsModal}
          disabled={items.length === 0 || generating || savingDraft}
        >
          <Text style={styles.btnSendText}>{generating ? 'Enviando…' : 'Enviar cotización'}</Text>
        </TouchableOpacity>
      </View>
      ) : (
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.btnDraft, resharing && styles.btnDisabled]}
            onPress={handleResharePdf}
            disabled={resharing}
          >
            <Text style={styles.btnDraftText}>{resharing ? 'Compartiendo…' : 'Reenviar PDF'}</Text>
          </TouchableOpacity>
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

      <QuoteTermsModal
        visible={termsModalVisible}
        initialTerms={termsAndConditions}
        initialObservations={observations}
        initialSeller={seller}
        loading={generating}
        onCancel={() => setTermsModalVisible(false)}
        onConfirm={handleConfirmTermsAndSend}
      />
    </ScreenContainer>
  );
}
