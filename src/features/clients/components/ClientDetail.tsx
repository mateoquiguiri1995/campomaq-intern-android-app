import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/src_features_clients_components_ClientDetail';
import { formatCurrency } from '@/utils/currency';

import type { ClientDetail as ClientDetailType, ClientInvoice } from '../types';
import { ClientAvatar } from './ClientAvatar';

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

function InvoiceCard({ invoice }: { invoice: ClientInvoice }) {
  const router = useRouter();
  const isSalesNote = invoice.isSalesNote || invoice.total === 0;

  return (
    <Pressable style={styles.invoiceCard} onPress={() => router.push(`/client/invoice/${invoice.invoiceNumber}`)}>
      <View style={styles.invoiceTopRow}>
        <Text style={styles.invoiceHeader}>
          {formatDate(invoice.issuedAt).toUpperCase()} · {isSalesNote ? `nota de credito #${invoice.invoiceNumber}` : invoice.code}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {isSalesNote && (
            <Badge
              label="nota de credito"
              backgroundColor="#E3F2FD"
              textColor="#1565C0"
            />
          )}
          {invoice.status && (
            <Badge
              label={invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
              backgroundColor={invoice.status === 'paid' ? '#E8F5E9' : '#FFF3E0'}
              textColor={invoice.status === 'paid' ? '#2E7D32' : '#B25E00'}
            />
          )}
        </View>
      </View>

      <Text style={styles.invoiceName}>{isSalesNote ? 'nota de credito' : invoice.name}</Text>
      <Text style={styles.invoiceMeta}>
        {invoice.itemCount} {invoice.itemCount === 1 ? 'Item' : 'items'} - {invoice.paymentMethod}
      </Text>

      <View style={styles.dashedLine} />

      <View style={styles.invoiceBottomRow}>
        <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.primaryDark} />
      </View>
    </Pressable>
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
    const clientSummary = {
      id: client.id,
      name: client.name,
      ruc: client.ruc,
      email: client.email,
      phone: client.phone,
      location: client.location,
      score: client.score,
      hasPendingCredit: client.hasPendingCredit,
    };
    router.push({
      pathname: '/quotes/select-client',
      params: {
        clientId: client.id,
        clientData: JSON.stringify(clientSummary),
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
          icon="document-text"
          label="Cotizar"
          onPress={handleNewSale}
        />
      </View>

      <View style={styles.metrics}>
        <MetricCard label="VENTAS 6 MESES" value={formatCompactCurrency(client.totalPurchases)} />
        <MetricCard label="COMPRAS 6 MESES" value={String(client.purchaseCount)} />
        <MetricCard label="FRECUENCIA" value={client.scoreLabel} />
      </View>

      <View style={styles.tabs}>
        <TabButton label="Historial" active={activeTab === 'history'} onPress={() => setActiveTab('history')} />
        <TabButton label="Datos" active={activeTab === 'data'} onPress={() => setActiveTab('data')} />
        <TabButton label="Notas" active={activeTab === 'notes'} onPress={() => setActiveTab('notes')} />
      </View>

      {activeTab === 'history' && (
        <View style={styles.section}>
          {client.invoices.length > 0 ? (
            client.invoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)
          ) : (
            <Text style={styles.emptyText}>No hay facturas recientes para este cliente.</Text>
          )}
        </View>
      )}

      {activeTab === 'data' && (
        <View style={styles.dataCard}>
          <DataRow label="Nombre" value={client.name} />
          <DataRow label="RUC/CI" value={client.ruc} />
          <DataRow label="Ubicación" value={client.location ?? 'No registrada'} />
          <DataRow label="Teléfono" value={client.phone ?? 'No registrado'} />
          <DataRow label="Teléfono secundario" value={client.phoneSecondary ?? 'No registrado'} />
          <DataRow label="Correo" value={client.email ?? 'No registrado'} />
          <DataRow label="Última compra" value={client.lastPurchaseDate ? formatDate(client.lastPurchaseDate) : 'Sin compras registradas'} />
          <DataRow label="Días desde última compra" value={client.daysSinceLastPurchase?.toString() ?? 'No disponible'} />
          <DataRow label="Estado de actividad" value={getRecencyLabel(client.recencyStatus)} />
          <DataRow label="Meses con compras (últimos 6)" value={client.purchaseMonthsLast6Months?.toString() ?? '0'} />
        </View>
      )}

      {activeTab === 'notes' && (
        <View style={styles.section}>
          <Text style={styles.emptyText}>No hay notas comerciales registradas para este cliente.</Text>
        </View>
      )}
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  const isScore = label === 'FRECUENCIA';
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

function getRecencyLabel(value?: string): string {
  if (value === 'Active') return 'Activo';
  if (value === 'At risk') return 'En riesgo';
  return 'Sin clasificar';
}
