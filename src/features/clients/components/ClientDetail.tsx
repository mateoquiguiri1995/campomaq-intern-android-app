import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/currency';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { downloadMockInvoicePdf } from '../services/clientDetailService';
import type { ClientDetail as ClientDetailType, ClientInvoice } from '../types';
import { ClientAvatar } from './ClientAvatar';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';

type DetailTab = 'history' | 'data' | 'notes';

interface ClientDetailProps {
  client: ClientDetailType;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return formatCurrency(value);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
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
      <Ionicons name={icon} size={18} color={colors.black} />
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
        <Text style={styles.invoiceHeader}>
          {formatDate(invoice.issuedAt).toUpperCase()} · {invoice.code}
        </Text>
        <Badge
          label={isPaid ? 'Pagada' : 'Pendiente'}
          backgroundColor={isPaid ? '#E8F5E9' : '#FFF3E0'}
          textColor={isPaid ? '#2E7D32' : '#B25E00'}
        />
      </View>

      <Text style={styles.invoiceName}>{invoice.name}</Text>
      <Text style={styles.invoiceMeta}>
        {invoice.itemCount} {invoice.itemCount === 1 ? 'Item' : 'items'} - {invoice.paymentMethod}
      </Text>

      <View style={styles.dashedLine} />

      <View style={styles.invoiceBottomRow}>
        <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
        <Pressable
          style={({ pressed }) => [styles.detailLink, pressed && styles.pressed, downloading && styles.disabled]}
          onPress={handleDownload}
          disabled={downloading}
        >
          <Text style={styles.detailLinkText}>{downloading ? 'Generando...' : 'Ver detalle'}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
        </Pressable>
      </View>
    </View>
  );
}

export function ClientDetail({ client }: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('history');
  const router = useRouter();
  const { resetBuilder } = useQuoteBuilder();

  function openContact(url: string, unavailableMessage: string) {
    Linking.openURL(url).catch(() => Alert.alert('Acción no disponible', unavailableMessage));
  }

  function handleNewSale() {
    resetBuilder();
    router.push({
      pathname: '/quotes/select-client',
      params: {
        clientId: client.id,
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <ClientAvatar name={client.name} size={76} />
        <View style={styles.profileText}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.ruc}>
            {client.contactName ? `${client.contactName} · ` : ''}RUC {client.ruc}
          </Text>
          {client.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.gray} />
              <Text style={styles.location}>{client.location}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon="call"
          label="Llamar"
          disabled={!client.phone}
          onPress={() => openContact(`tel:${client.phone}`, 'No hay teléfono registrado para este cliente.')}
        />
        <ActionButton
          icon="mail"
          label="Email"
          disabled={!client.email}
          onPress={() => openContact(`mailto:${client.email}`, 'No hay correo registrado para este cliente.')}
        />
        <ActionButton
          icon="cart"
          label="Nueva venta"
          onPress={handleNewSale}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="VIDA TOTAL" value={formatCompactCurrency(client.totalPurchases)} />
        <MetricCard label="COMPRAS" value={String(client.purchaseCount)} />
        <MetricCard label="SCORE" value={client.scoreLabel} />
      </View>

      <View style={styles.tabs}>
        <TabButton label="Historial" active={activeTab === 'history'} onPress={() => setActiveTab('history')} />
        <TabButton label="Datos" active={activeTab === 'data'} onPress={() => setActiveTab('data')} />
        <TabButton label="Notas" active={activeTab === 'notes'} onPress={() => setActiveTab('notes')} />
      </View>

      {activeTab === 'history' && (
        <View style={styles.section}>
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
  const isScore = label === 'SCORE';
  return (
    <View style={[styles.metricCard, isScore && styles.metricCardScore]}>
      <Text style={[styles.metricLabel, isScore && styles.metricLabelScore]}>{label}</Text>
      {isScore ? (
        <View style={styles.metricValueScore}>
          <Ionicons name="star" size={14} color={colors.primary} />
          <Text style={styles.scoreText}>{value}</Text>
        </View>
      ) : (
        <Text style={styles.metricValue}>{value}</Text>
      )}
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

import { styles } from '@/theme/styles/src_features_clients_components_ClientDetail';
