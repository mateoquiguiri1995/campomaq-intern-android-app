import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { QuoteItemRow } from '@/features/quotes/components/QuoteItemRow';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getQuoteTotals } from '@/features/quotes/services/quoteCalculations';
import { getClientDisplayName, getClientDisplaySubtitle } from '@/features/quotes/services/quoteClient';
import { shareQuotePdf } from '@/features/quotes/services/quotePdf';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currency';

/** Paso 3: revisar la cotización, guardarla como borrador o generar y compartir el PDF. */
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

  if (hydrating) {
    return (
      <ScreenContainer scroll={false}>
        <Stack.Screen options={{ title: 'Cotización' }} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!client) {
    return (
      <ScreenContainer scroll={false}>
        <Stack.Screen options={{ title: 'Cotización' }} />
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
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Resumen de cotización', headerBackTitle: 'Productos' }} />

      <View style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <Text style={styles.clientName}>{getClientDisplayName(client)}</Text>
          {client.kind === 'manual' && (
            <Badge label="Cliente nuevo" backgroundColor={colors.warning} textColor={colors.onPrimary} />
          )}
        </View>
        {clientSubtitle ? <Text style={styles.clientSubtitle}>{clientSubtitle}</Text> : null}
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>Aún no has añadido productos a esta cotización.</Text>
      ) : (
        <View style={styles.items}>
          {items.map((item) => (
            <QuoteItemRow
              key={item.product.id}
              item={item}
              onEdit={() => setEditingProduct(item.product)}
              onRemove={() => removeItem(item.product.id)}
            />
          ))}
        </View>
      )}

      <Button
        label="Añadir más productos"
        variant="ghost"
        onPress={() => router.push('/quotes/select-products')}
      />

      {items.length > 0 && (
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>IVA (15%)</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totals.iva)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.totalsRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(totals.total)}</Text>
          </View>
        </View>
      )}

      <Button
        label={savingDraft ? 'Guardando…' : 'Guardar borrador'}
        variant="ghost"
        onPress={handleSaveDraft}
        disabled={items.length === 0 || savingDraft || generating}
      />
      <Button
        label={generating ? 'Generando…' : 'Generar PDF y compartir'}
        onPress={handleGenerateAndShare}
        disabled={items.length === 0 || generating || savingDraft}
      />

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
  },
  clientCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  clientSubtitle: {
    ...typography.caption,
    color: colors.grayDark,
  },
  items: {
    gap: spacing.md,
  },
  totals: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalsRowFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalsLabel: {
    ...typography.body,
    color: colors.grayDark,
  },
  totalsValue: {
    ...typography.body,
    color: colors.black,
  },
  totalLabelFinal: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
  totalValueFinal: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '700',
  },
});
