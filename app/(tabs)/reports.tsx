import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { listQuotes, updateQuoteStatus } from '@/features/quotes/services/quoteService';
import type { Quote, QuoteItem, PriceTier, QuoteStatus } from '@/features/quotes/types';
import type { Product } from '@/features/catalog/types';
import { spacing } from '@/theme/spacing';
import { colors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';
import { modalStyles, styles } from '@/theme/styles/app_tabs_reports';

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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

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

  function handleNewQuote() {
    router.push('/quotes/select-client');
  }

  function handleOpenQuote(quote: Quote) {
    router.push({ pathname: '/quotes/summary', params: { draftId: quote.id } });
  }

  function handleStatusChange(quote: Quote) {
    if (quote.status !== 'Enviada') return;
    setSelectedQuote(quote);
    setStatusModalVisible(true);
  }

  async function updateStatus(id: string, status: QuoteStatus) {
    try {
      await updateQuoteStatus(id, status);
      loadQuotes();
    } catch (error) {
      Alert.alert('No se pudo actualizar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    }
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
  const displayCount = filteredQuotes.length;
  const acceptedQuotes = filteredQuotes.filter((q) => getQuoteStatusText(q) === 'Aceptada');
  const displayPct = filteredQuotes.length > 0
    ? Math.round((acceptedQuotes.length / filteredQuotes.length) * 100)
    : 0;

  const pipelineVal = filteredQuotes
    .filter((quote) => quote.status === 'Pendiente' || quote.status === 'Enviada')
    .reduce((sum, quote) => sum + getQuoteTotal(quote), 0);
  const displayPipeline = pipelineVal;

  const pendingQuotes = filteredQuotes.filter(
    (q) => getQuoteStatusText(q) === 'Pendiente' || getQuoteStatusText(q) === 'Enviada'
  );
  const displayPending = pendingQuotes.length;

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
              <Text style={styles.darkCardMetricValueCentered}>{displayPending}</Text>
              <Text style={styles.darkCardMetricLabelCentered}>Pendientes de respuesta</Text>
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
                      activeOpacity={quote.status === 'Enviada' ? 0.7 : 1}
                      disabled={quote.status !== 'Enviada'}
                      onPress={() => handleStatusChange(quote)}
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

      {/* Modal de actualización de estado */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable style={modalStyles.overlay} onPress={() => setStatusModalVisible(false)}>
          <Pressable style={modalStyles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Actualizar cotización</Text>
              <Text style={modalStyles.subtitle}>
                ¿Cuál fue el resultado de la cotización para {selectedQuote?.client.client.name}?
              </Text>
            </View>

            <View style={modalStyles.optionsContainer}>
              {/* Opción Aceptada */}
              <Pressable
                style={modalStyles.acceptedBtn}
                onPress={() => {
                  if (selectedQuote) {
                    updateStatus(selectedQuote.id, 'Aceptada');
                  }
                  setStatusModalVisible(false);
                }}
              >
                <Text style={modalStyles.acceptedBtnText}>ACEPTADA</Text>
              </Pressable>

              {/* Opción Rechazada */}
              <Pressable
                style={modalStyles.rejectedBtn}
                onPress={() => {
                  if (selectedQuote) {
                    updateStatus(selectedQuote.id, 'Rechazada');
                  }
                  setStatusModalVisible(false);
                }}
              >
                <Text style={modalStyles.rejectedBtnText}>RECHAZADA</Text>
              </Pressable>
            </View>

            <Pressable style={modalStyles.cancelBtn} onPress={() => setStatusModalVisible(false)}>
              <Text style={modalStyles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

    </ScreenContainer>
  );
}

