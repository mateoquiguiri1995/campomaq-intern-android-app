import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { getInvoiceDetail, type InvoiceDetail } from '@/features/clients/services/invoiceService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatCurrency } from '@/utils/currency';

function formatDate(value?: string) {
  if (!value) return 'No disponible';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-EC');
}

export default function InvoiceScreen() {
  const { invoiceNumber } = useLocalSearchParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceNumber) return;
    getInvoiceDetail(invoiceNumber).then(setInvoice).catch(() => {
      setError('No pudimos cargar el detalle de esta factura.');
    });
  }, [invoiceNumber]);

  const isSalesNote = invoice ? invoice.total === 0 : false;

  return (
    <ScreenContainer hasHeader>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isSalesNote ? `nota de credito #${invoiceNumber}` : `Factura #${invoiceNumber}`,
          headerBackTitle: 'Cliente',
        }}
      />
      {!invoice && !error && <View style={styles.center}><ActivityIndicator color={colors.primaryDark} /></View>}
      {error && <View style={styles.center}><Text style={styles.error}>{error}</Text></View>}
      {invoice && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerCard}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title}>
                {isSalesNote ? `nota de credito #${invoice.number}` : `FACTURA #${invoice.number}`}
              </Text>
              {isSalesNote && (
                <Badge
                  label="nota de credito"
                  backgroundColor="#E3F2FD"
                  textColor="#1565C0"
                />
              )}
            </View>
            <Text style={styles.date}>{formatDate(invoice.issuedAt)}</Text>
            {invoice.clientName && <Text style={styles.client}>{invoice.clientName}</Text>}
            {invoice.clientId && <Text style={styles.meta}>RUC/CI: {invoice.clientId}</Text>}
            {invoice.address && <Text style={styles.meta}>{invoice.address}</Text>}
            {invoice.paymentType && <Text style={styles.payment}>{invoice.paymentType}</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>DETALLE</Text>
            {invoice.items.length > 0 ? (
              invoice.items.map((item, index) => (
                <View key={`${item.code ?? index}-${index}`} style={styles.line}>
                  <View style={styles.lineText}>
                    <Text style={styles.description}>{item.description}</Text>
                    {item.code && <Text style={styles.meta}>Cód. {item.code}</Text>}
                    <Text style={styles.meta}>
                      {item.quantity ?? 0} × {formatCurrency(item.unitPrice ?? 0)}
                    </Text>
                    {item.creditNoteValue ? (
                      <Text style={styles.credit}>
                        Nota de crédito: -{formatCurrency(item.creditNoteValue)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.amount}>
                    {formatCurrency(item.total ?? (item.quantity ?? 0) * (item.unitPrice ?? 0))}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.meta}>El documento no contiene líneas de detalle.</Text>
            )}
          </View>

          <View style={styles.card}>
            {invoice.subtotal !== undefined && <Row label="Subtotal" value={invoice.subtotal} />}
            {invoice.tax !== undefined && <Row label="IVA" value={invoice.tax} />}
            {invoice.total !== undefined && <Row label="TOTAL CON IVA" value={invoice.total} strong />}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.amount, strong && styles.strong]}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
  content: { paddingVertical: spacing.md, gap: spacing.md },
  headerCard: { backgroundColor: colors.black, borderRadius: 16, padding: spacing.md, gap: 4 },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  date: { color: colors.surface, fontSize: 14 },
  client: { color: colors.surface, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
  meta: { color: colors.grayDark, fontSize: 12 },
  payment: {
    alignSelf: 'flex-start',
    color: colors.black,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  section: { fontSize: 12, color: colors.grayDark, fontWeight: '800' },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineText: { flex: 1, gap: 2 },
  description: { color: colors.black, fontWeight: '600' },
  amount: { color: colors.black, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: colors.grayDark },
  strong: { color: colors.black, fontWeight: '800', fontSize: 16 },
  credit: { color: colors.danger, fontSize: 12 },
});
