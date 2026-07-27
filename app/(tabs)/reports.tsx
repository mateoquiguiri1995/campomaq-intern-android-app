import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { deleteQuote, listQuotes, updateQuoteStatus } from '@/features/quotes/services/quoteService';
import type { Quote, QuoteItem, PriceTier, QuoteStatus } from '@/features/quotes/types';
import type { Product } from '@/features/catalog/types';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';

type PeriodType = 'Semana' | 'Mes' | 'Trimestre';

function getUnitPrice(product: Product, priceTier: PriceTier): number {
  if (priceTier === 'A') return product.priceA;
  if (priceTier === 'B') return product.priceB;
  return product.priceC;
}

function getLineTotal(item: QuoteItem): number {
  const price = getUnitPrice(item.product, item.priceTier);
  const subtotal = price * item.quantity;
  if (item.discountPct) {
    return subtotal * (1 - item.discountPct / 100);
  }
  return subtotal;
}

function getQuoteTotal(quote: Quote): number {
  const subtotal = quote.items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const iva = subtotal * 0.15; // 15% IVA
  return subtotal + iva;
}

function formatQuoteDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getQuoteStatusText(quote: Quote): 'Enviada' | 'Aceptada' | 'Pendiente' | 'Rechazada' {
  return quote.status;
}

export default function ReportsScreen() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Mes');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);

  const loadQuotes = useCallback(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    listQuotes()
      .then((data) => {
        if (!isMounted) return;
        setQuotes(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setQuotes([]);
        setError(err instanceof Error ? err.message : 'No pudimos cargar las cotizaciones.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuotes();
    }, [loadQuotes])
  );

  async function handleUpdateStatus(status: QuoteStatus) {
    if (!selectedQuote) return;
    try {
      await updateQuoteStatus(selectedQuote.id, status);
      loadQuotes();
      setStatusPickerVisible(false);
      setSelectedQuote(null);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo actualizar el estado.');
    }
  }

  function handleNewQuote() {
    router.push('/quotes/select-client');
  }

  function handleOpenQuote(quote: Quote) {
    router.push({ pathname: '/quotes/summary', params: { draftId: quote.id } });
  }

  // Filtrado dinámico por período
  const getFilteredQuotes = () => {
    const now = new Date();
    let msLimit = 30 * 24 * 60 * 60 * 1000; // Mes
    if (selectedPeriod === 'Semana') {
      msLimit = 7 * 24 * 60 * 60 * 1000;
    } else if (selectedPeriod === 'Trimestre') {
      msLimit = 90 * 24 * 60 * 60 * 1000;
    }
    const limitDate = new Date(now.getTime() - msLimit);
    return quotes.filter((q) => new Date(q.createdAt) >= limitDate);
  };

  const filteredQuotes = getFilteredQuotes();

  // Cálculos dinámicos para la tarjeta oscura
  const displayCount = filteredQuotes.length > 0 ? filteredQuotes.length : 5;
  const acceptedQuotes = filteredQuotes.filter((q) => getQuoteStatusText(q) === 'Aceptada');
  const displayPct = filteredQuotes.length > 0
    ? Math.round((acceptedQuotes.length / filteredQuotes.length) * 100)
    : 40;

  const pipelineVal = filteredQuotes.reduce((sum, q) => sum + getQuoteTotal(q), 0);
  const displayPipeline = filteredQuotes.length > 0 ? pipelineVal : 3230.5;

  const pendingQuotes = filteredQuotes.filter(
    (q) => getQuoteStatusText(q) === 'Pendiente' || getQuoteStatusText(q) === 'Enviada'
  );
  const displayPending = filteredQuotes.length > 0 ? pendingQuotes.length : 1;

  const getBadgeStyles = (statusText: string) => {
    switch (statusText) {
      case 'Aceptada':
        return { bg: '#E6F4EA', text: '#137333' };
      case 'Rechazada':
        return { bg: '#FCE8E6', text: '#C5221F' };
      case 'Pendiente':
        return { bg: '#FEF7E0', text: '#B06000' };
      default: // Enviada
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Cotizaciones</Text>

        {/* Selector de Período */}
        <View style={styles.periodSelectorContainer}>
          {(['Semana', 'Mes', 'Trimestre'] as PeriodType[]).map((p) => {
            const isActive = selectedPeriod === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, isActive && styles.periodTabActive]}
                onPress={() => setSelectedPeriod(p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.periodTabText, isActive && styles.periodTabTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tarjeta de Métricas del Período */}
        <View style={styles.darkCard}>
          <Text style={styles.darkCardLabel}>
            COTIZACIONES DEL {selectedPeriod.toUpperCase()}
          </Text>
          <View style={styles.darkCardHeaderRow}>
            <Text style={styles.darkCardValue}>{displayCount}</Text>
            <View style={styles.badgeAceptadaInline}>
              <Text style={styles.badgeAceptadaInlineText}>↗ {displayPct}% aceptadas</Text>
            </View>
          </View>

          <View style={styles.darkCardMetricsRow}>
            <View style={styles.darkCardMetric}>
              <Text style={styles.darkCardMetricValue}>{formatCurrency(displayPipeline)}</Text>
              <Text style={styles.darkCardMetricLabel}>Valor en pipeline</Text>
            </View>
            <View style={styles.darkCardMetric}>
              <Text style={styles.darkCardMetricValue}>{displayPending}</Text>
              <Text style={styles.darkCardMetricLabel}>Pendientes de respuesta</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>COTIZACIONES RECIENTES</Text>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.message}>Cargando cotizaciones...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>No pudimos cargar las cotizaciones</Text>
            <Text style={styles.message}>{error}</Text>
          </View>
        )}

        {!loading && filteredQuotes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes cotizaciones registradas en este período.</Text>
          </View>
        )}

        {filteredQuotes.length > 0 && (
          <View style={styles.list}>
            {filteredQuotes.map((quote) => {
              const statusText = getQuoteStatusText(quote);
              const badgeStyle = getBadgeStyles(statusText);
              const total = getQuoteTotal(quote);
              const clientName = quote.client.client.name;

              const cleanedId = quote.id.replace(/[^a-zA-Z0-9]/g, '');
              const cotNum = cleanedId.substring(cleanedId.length - 4).toUpperCase();

              return (
                <TouchableOpacity
                  key={quote.id}
                  style={styles.quoteCard}
                  activeOpacity={0.8}
                  onPress={() => handleOpenQuote(quote)}
                >
                  <View style={styles.quoteCardHeader}>
                    <Text style={styles.quoteCardCode}>
                      COT-{cotNum} · {formatQuoteDate(quote.createdAt)}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={quote.status === 'Pendiente'}
                      onPress={() => {
                        setSelectedQuote(quote);
                        setStatusPickerVisible(true);
                      }}
                      style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}
                    >
                      <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                        {statusText}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.quoteCardClient}>{clientName}</Text>

                  <View style={styles.dottedDivider} />

                  <View style={styles.quoteCardFooter}>
                    <Text style={styles.quoteCardPrice}>{formatCurrency(total)}</Text>
                    <Text style={styles.quoteCardAction}>Ver &gt;</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Botón flotante FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={handleNewQuote}
      >
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>

      <StatusPickerModal
        visible={statusPickerVisible}
        currentStatus={selectedQuote ? selectedQuote.status : null}
        onCancel={() => {
          setStatusPickerVisible(false);
          setSelectedQuote(null);
        }}
        onConfirm={handleUpdateStatus}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    marginTop: spacing.sm,
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginVertical: spacing.xs,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm - 2,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  periodTabTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  darkCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  darkCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    letterSpacing: 0.5,
  },
  darkCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  darkCardValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeAceptadaInline: {
    backgroundColor: 'rgba(235, 214, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeAceptadaInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  darkCardMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  darkCardMetric: {
    flex: 1,
  },
  darkCardMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  darkCardMetricLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grayDark,
    marginTop: spacing.xs,
  },
  center: {
    paddingVertical: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    textAlign: 'center',
    color: colors.grayDark,
  },
  errorTitle: {
    fontWeight: '700',
    color: '#C5221F',
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.grayDark,
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  quoteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteCardCode: {
    fontSize: 11,
    color: colors.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  quoteCardClient: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
  },
  dottedDivider: {
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  quoteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteCardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  quoteCardAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
});

const STATUSES: QuoteStatus[] = ['Pendiente', 'Enviada', 'Aceptada', 'Rechazada'];

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: QuoteStatus | null;
  onCancel: () => void;
  onConfirm: (status: QuoteStatus) => void;
}

function StatusPickerModal({ visible, currentStatus, onCancel, onConfirm }: StatusPickerModalProps) {
  const getStatusStyles = (status: QuoteStatus) => {
    switch (status) {
      case 'Aceptada':
        return { bg: '#E6F4EA', text: '#137333' };
      case 'Rechazada':
        return { bg: '#FCE8E6', text: '#C5221F' };
      case 'Pendiente':
        return { bg: '#FEF7E0', text: '#B06000' };
      default: // Enviada
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  const getAvailableStatuses = (): QuoteStatus[] => {
    return ['Aceptada', 'Rechazada'];
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={modalStyles.overlay} onPress={onCancel}>
        <Pressable style={modalStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Cambiar estado de cotización</Text>
            <Text style={modalStyles.subtitle}>Selecciona el nuevo estado para este documento:</Text>
          </View>

          <View style={modalStyles.optionsContainer}>
            {availableStatuses.map((status) => {
              const styles = getStatusStyles(status);
              const isSelected = currentStatus === status;

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    modalStyles.optionCard,
                    isSelected && { borderColor: styles.text, borderWidth: 1.5 }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onConfirm(status)}
                >
                  <View style={modalStyles.optionHeader}>
                    <View style={[modalStyles.badge, { backgroundColor: styles.bg }]}>
                      <Text style={[modalStyles.badgeText, { color: styles.text }]}>
                        {status}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={styles.text} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  optionsContainer: {
    gap: 12,
    marginVertical: 8,
  },
  optionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
