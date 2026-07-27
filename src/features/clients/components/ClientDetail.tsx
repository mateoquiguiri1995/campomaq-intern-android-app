import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/currency';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { downloadMockInvoicePdf } from '../services/clientDetailService';
import type { ClientDetail, ClientInvoice } from '../types';
import { ClientAvatar } from './ClientAvatar';

type DetailTab = 'history' | 'data' | 'notes';

interface ClientDetailProps {
  client: ClientDetail;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return formatCurrency(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color={colors.black} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function InvoiceCard({ invoice, clientName }: { invoice: ClientInvoice; clientName: string }) {
  const [downloading, setDownloading] = useState(false);
  const isPaid = invoice.status === 'paid';

  async function handleDownload() {
    try {
      setDownloading(true);
      await downloadMockInvoicePdf(invoice, clientName);
    } catch (error) {
      Alert.alert(
        'No pudimos generar el PDF',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.'
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceTopRow}>
        <View>
          <Text style={styles.invoiceDate}>{formatDate(invoice.issuedAt)}</Text>
          <Text style={styles.invoiceCode}>{invoice.code}</Text>
        </View>
        <Badge
          label={isPaid ? 'Pagada' : 'Pendiente'}
          backgroundColor={isPaid ? colors.success : colors.warning}
          textColor={isPaid ? colors.surface : colors.black}
        />
      </View>

      <Text style={styles.invoiceName}>{invoice.name}</Text>
      <Text style={styles.invoiceMeta}>{invoice.itemCount} ítems · {invoice.paymentMethod}</Text>

      <View style={styles.invoiceBottomRow}>
        <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
        <Pressable
          style={({ pressed }) => [styles.pdfButton, pressed && styles.pressed, downloading && styles.disabled]}
          onPress={handleDownload}
          disabled={downloading}
        >
          <Ionicons name="document-text-outline" size={16} color={colors.black} />
          <Text style={styles.pdfButtonText}>{downloading ? 'Generando...' : 'PDF'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ClientDetail({ client }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('history');

  function openContact(url: string, unavailableMessage: string) {
    Linking.openURL(url).catch(() => Alert.alert('Acción no disponible', unavailableMessage));
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <ClientAvatar name={client.name} size={76} />
        <View style={styles.profileText}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.ruc}>RUC/CI: {client.ruc}</Text>
          {client.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={15} color={colors.grayDark} />
              <Text style={styles.location}>{client.location}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon="call-outline"
          label="Llamar"
          disabled={!client.phone}
          onPress={() => openContact(`tel:${client.phone}`, 'No hay teléfono registrado para este cliente.')}
        />
        <ActionButton
          icon="mail-outline"
          label="Email"
          disabled={!client.email}
          onPress={() => openContact(`mailto:${client.email}`, 'No hay correo registrado para este cliente.')}
        />
        <ActionButton
          icon="chatbubble-outline"
          label="SMS"
          disabled={!client.phone}
          onPress={() => openContact(`sms:${client.phone}`, 'No hay teléfono registrado para este cliente.')}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Compras totales" value={formatCompactCurrency(client.totalPurchases)} />
        <MetricCard label="Compras" value={String(client.purchaseCount)} />
        <MetricCard label="Score" value={client.scoreLabel} />
      </View>

      <View style={styles.tabs}>
        <TabButton label="Historial" active={activeTab === 'history'} onPress={() => setActiveTab('history')} />
        <TabButton label="Datos" active={activeTab === 'data'} onPress={() => setActiveTab('data')} />
        <TabButton label="Notas" active={activeTab === 'notes'} onPress={() => setActiveTab('notes')} />
      </View>

      {activeTab === 'history' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturas de los últimos 12 meses</Text>
          {client.invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} clientName={client.name} />
          ))}
        </View>
      )}

      {activeTab === 'data' && (
        <View style={styles.dataCard}>
          <DataRow label="Nombre" value={client.name} />
          <DataRow label="RUC/CI" value={client.ruc} />
          <DataRow label="Ubicación" value={client.location ?? 'No registrada'} />
          <DataRow label="Teléfono" value={client.phone ?? 'No registrado'} />
          <DataRow label="Correo" value={client.email ?? 'No registrado'} />
        </View>
      )}

      {activeTab === 'notes' && (
        <View style={styles.section}>
          {client.notes.map((note) => (
            <View key={note} style={styles.noteCard}>
              <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileText: { flex: 1, gap: spacing.xs },
  name: { ...typography.title, color: colors.black, fontSize: 22 },
  ruc: { ...typography.body, color: colors.grayDark },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  location: { ...typography.caption, color: colors.grayDark, flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  actionLabel: { ...typography.caption, fontWeight: '700', color: colors.black },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metricCard: { flex: 1, minHeight: 84, justifyContent: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  metricValue: { ...typography.subtitle, color: colors.black, fontWeight: '700' },
  metricLabel: { ...typography.caption, color: colors.grayDark, marginTop: spacing.xs },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: colors.primaryDark },
  tabLabel: { ...typography.body, color: colors.grayDark },
  tabLabelActive: { color: colors.black, fontWeight: '700' },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.subtitle, color: colors.black, fontWeight: '700' },
  invoiceCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  invoiceTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  invoiceDate: { ...typography.caption, color: colors.grayDark },
  invoiceCode: { ...typography.caption, color: colors.gray, marginTop: 2 },
  invoiceName: { ...typography.body, color: colors.black, fontWeight: '600' },
  invoiceMeta: { ...typography.caption, color: colors.grayDark },
  invoiceBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invoiceTotal: { ...typography.subtitle, color: colors.black, fontWeight: '700' },
  pdfButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  pdfButtonText: { ...typography.caption, color: colors.black, fontWeight: '700' },
  dataCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  dataRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 2 },
  dataLabel: { ...typography.caption, color: colors.gray },
  dataValue: { ...typography.body, color: colors.black },
  noteCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  noteText: { ...typography.body, color: colors.grayDark, flex: 1 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
});
