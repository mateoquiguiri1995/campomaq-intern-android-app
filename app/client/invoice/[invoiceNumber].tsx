import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { getInvoiceDetail, type InvoiceDetail } from '@/features/clients/services/invoiceService';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/app_client_invoice';
import { formatCurrency } from '@/utils/currency';

function formatInvoiceDate(value?: string): string {
  if (!value) return 'No disponible';
  const clean = value.slice(0, 10);
  const date = new Date(`${clean}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function InvoiceScreen() {
  const { invoiceNumber } = useLocalSearchParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceNumber) return;
    let isMounted = true;
    getInvoiceDetail(invoiceNumber)
      .then((detail) => {
        if (isMounted) setInvoice(detail);
      })
      .catch(() => {
        if (isMounted) setError('No pudimos cargar el detalle de este comprobante.');
      });
    return () => {
      isMounted = false;
    };
  }, [invoiceNumber]);

  const isSalesNote = invoice ? invoice.total === 0 : false;

  async function handleShareInvoice(inv: InvoiceDetail) {
    try {
      const isNote = inv.total === 0;
      const lines = [
        `*CAMPO MAQ — ${isNote ? 'Nota de Crédito' : 'Factura'} #${inv.number}*`,
        `📅 Fecha: ${formatInvoiceDate(inv.issuedAt)}`,
        inv.clientName ? `👤 Cliente: ${inv.clientName}` : null,
        inv.clientId ? `🆔 RUC/CI: ${inv.clientId}` : null,
        inv.address ? `📍 Dirección: ${inv.address}` : null,
        inv.paymentType ? `💳 Forma de Pago: ${inv.paymentType}` : null,
        '',
        '*DETALLE DE PRODUCTOS:*',
        ...inv.items.map((item, idx) => {
          const qty = item.quantity ?? 1;
          const unit = item.unitPrice ? formatCurrency(item.unitPrice) : '';
          const total = formatCurrency(item.total ?? qty * (item.unitPrice ?? 0));
          let lineStr = `${idx + 1}. ${item.description} (${qty} und. × ${unit}) = ${total}`;
          if (item.code) lineStr += ` [Cód: ${item.code}]`;
          if (item.creditNoteValue) lineStr += `\n   ↳ N/C: -${formatCurrency(item.creditNoteValue)}`;
          return lineStr;
        }),
        '',
        inv.subtotal !== undefined ? `Subtotal: ${formatCurrency(inv.subtotal)}` : null,
        inv.tax !== undefined ? `IVA: ${formatCurrency(inv.tax)}` : null,
        `*TOTAL: ${formatCurrency(inv.total ?? 0)}*`,
        '',
        '_Comprobante emitido por Campo Maq · Cayambe, Ecuador_',
      ]
        .filter(Boolean)
        .join('\n');

      await Share.share({
        message: lines,
        title: `Factura #${inv.number} - Campo Maq`,
      });
    } catch (e) {
      console.warn('Error al compartir factura:', e);
    }
  }

  return (
    <ScreenContainer hasHeader edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isSalesNote ? `Nota de crédito #${invoiceNumber}` : `Factura #${invoiceNumber}`,
          headerBackTitle: 'Cliente',
        }}
      />

      {!invoice && !error && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primaryDark} size="large" />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} style={{ marginBottom: 8 }} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {invoice && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Tarjeta tipo Comprobante / Recibo Comercial */}
          <View style={styles.receiptCard}>
            {/* Franja decorativa Campo Maq */}
            <View style={styles.topStripeContainer}>
              <View style={styles.topStripeYellow} />
              <View style={styles.topStripeBlack} />
            </View>

            {/* Cabecera institucional */}
            <View style={styles.receiptHeader}>
              <View style={styles.companyRow}>
                <View style={styles.companyBrand}>
                  <Text style={styles.companyName}>CAMPO MAQ</Text>
                </View>

                {isSalesNote ? (
                  <Badge label="Nota de crédito" backgroundColor="#E3F2FD" textColor="#1565C0" />
                ) : (
                  <Badge label="Generada" backgroundColor="#E8F5E9" textColor="#137333" />
                )}
              </View>

              {/* Barra de Tipo y Número de Comprobante */}
              <View style={styles.documentInfoBar}>
                <View>
                  <Text style={styles.documentTypeTitle}>
                    {isSalesNote ? 'NOTA DE CRÉDITO' : 'FACTURA ELECTRÓNICA'}
                  </Text>
                  <Text style={styles.documentNumberText}>N° {invoice.number}</Text>
                </View>

                <Ionicons
                  name={isSalesNote ? 'receipt-outline' : 'checkmark-done-circle'}
                  size={24}
                  color={isSalesNote ? '#1565C0' : colors.success}
                />
              </View>
            </View>

            {/* Divisor perforado decorativo */}
            <View style={styles.perforatedContainer}>
              <View style={styles.leftNotch} />
              <View style={styles.perforatedLine} />
              <View style={styles.rightNotch} />
            </View>

            {/* Datos de Emisión y Cliente */}
            <View style={styles.metaSection}>
              <Text style={styles.sectionTitle}>INFORMACIÓN DEL COMPROBANTE</Text>

              <View style={styles.metaGrid}>
                {/* Fecha */}
                <View style={styles.metaRow}>
                  <View style={styles.metaLabelContainer}>
                    <Ionicons name="calendar-outline" size={15} color={colors.grayDark} />
                    <Text style={styles.metaLabel}>Fecha de emisión:</Text>
                  </View>
                  <Text style={styles.metaValue}>{formatInvoiceDate(invoice.issuedAt)}</Text>
                </View>

                {/* Cliente */}
                {!!invoice.clientName && (
                  <View style={styles.metaRow}>
                    <View style={styles.metaLabelContainer}>
                      <Ionicons name="person-outline" size={15} color={colors.grayDark} />
                      <Text style={styles.metaLabel}>Cliente:</Text>
                    </View>
                    <Text style={[styles.metaValue, styles.clientNameValue]} numberOfLines={2}>
                      {invoice.clientName}
                    </Text>
                  </View>
                )}

                {/* RUC / CI */}
                {!!invoice.clientId && (
                  <View style={styles.metaRow}>
                    <View style={styles.metaLabelContainer}>
                      <Ionicons name="card-outline" size={15} color={colors.grayDark} />
                      <Text style={styles.metaLabel}>RUC / C.I.:</Text>
                    </View>
                    <Text style={styles.metaValue}>{invoice.clientId}</Text>
                  </View>
                )}

                {/* Dirección */}
                {!!invoice.address && (
                  <View style={styles.metaRow}>
                    <View style={styles.metaLabelContainer}>
                      <Ionicons name="location-outline" size={15} color={colors.grayDark} />
                      <Text style={styles.metaLabel}>Dirección:</Text>
                    </View>
                    <Text style={styles.metaValue} numberOfLines={2}>
                      {invoice.address}
                    </Text>
                  </View>
                )}

                {/* Forma de Pago */}
                {!!invoice.paymentType && (
                  <View style={styles.metaRow}>
                    <View style={styles.metaLabelContainer}>
                      <Ionicons name="wallet-outline" size={15} color={colors.grayDark} />
                      <Text style={styles.metaLabel}>Forma de pago:</Text>
                    </View>
                    <View style={styles.paymentPill}>
                      <Text style={styles.paymentPillText}>{invoice.paymentType}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Divisor */}
            <View style={styles.divider} />

            {/* Detalle de Productos / Ítems */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>DETALLE DE ÍTEMS ({invoice.items.length})</Text>

              {/* Cabecera de tabla */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>PRODUCTO</Text>
                <Text style={styles.tableHeaderText}>SUBTOTAL</Text>
              </View>

              {invoice.items.length > 0 ? (
                invoice.items.map((item, index) => {
                  const qty = item.quantity ?? 1;
                  const unitPrice = item.unitPrice ?? 0;
                  const itemTotal = item.total ?? qty * unitPrice;

                  return (
                    <View key={`${item.code ?? index}-${index}`} style={styles.itemRow}>
                      <View style={styles.itemMain}>
                        <Text style={styles.itemDescription}>{item.description}</Text>

                        <View style={styles.itemMetaRow}>
                          {!!item.code && (
                            <View style={styles.codeBadge}>
                              <Text style={styles.codeText}>{item.code}</Text>
                            </View>
                          )}
                          <Text style={styles.calcText}>
                            {qty} unids. × {formatCurrency(unitPrice)}
                          </Text>
                        </View>

                        {!!item.creditNoteValue && (
                          <View style={styles.creditNoteBadge}>
                            <Text style={styles.creditNoteText}>
                              Nota de crédito: −{formatCurrency(item.creditNoteValue)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.itemTotalContainer}>
                        <Text style={styles.itemTotalAmount}>{formatCurrency(itemTotal)}</Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={[styles.metaLabel, { paddingVertical: 12 }]}>
                  El documento no contiene líneas de detalle.
                </Text>
              )}
            </View>

            {/* Divisor perforado antes de totales */}
            <View style={styles.perforatedContainer}>
              <View style={styles.leftNotch} />
              <View style={styles.perforatedLine} />
              <View style={styles.rightNotch} />
            </View>

            {/* Totales y Liquidación */}
            <View style={styles.totalsSection}>
              

              {invoice.subtotal !== undefined && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Subtotal</Text>
                  <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
                </View>
              )}

              {invoice.tax !== undefined && (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>I.V.A. (15%)</Text>
                  <Text style={styles.totalsValue}>{formatCurrency(invoice.tax)}</Text>
                </View>
              )}

              {/* Gran Total Destacado */}
              {invoice.total !== undefined && (
                <View style={styles.grandTotalCard}>
                  <Text style={styles.grandTotalLabel}>TOTAL FACTURA</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
                </View>
              )}
            </View>

            
          </View>

          {/* Botón de acción: Compartir comprobante */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              activeOpacity={0.8}
              onPress={() => handleShareInvoice(invoice)}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.surface} />
              <Text style={styles.shareButtonText}>Compartir detalle por WhatsApp / Correo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
