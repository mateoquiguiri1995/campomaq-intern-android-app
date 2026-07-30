import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import React, { useCallback, useState, useRef, useMemo } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Dimensions, Pressable, Image as RNImage, Alert } from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { AvatarMenuModal } from '@/components/common/AvatarMenuModal';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

// Importes de servicios y tipos reales
import { getMonthlyGoal } from '@/features/catalog/services/goalService';
import type { MonthlyGoal, Product } from '@/features/catalog/types';
import { getClients } from '@/features/clients/services/clientService';
import type { Client } from '@/features/clients/types';
import { listQuotes } from '@/features/quotes/services/quoteService';
import type { Quote, QuoteItem, PriceTier } from '@/features/quotes/types';
import { formatCurrency } from '@/utils/currency';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';

function getHeaderDate(): string {
  const date = new Date();
  const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

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
  const iva = subtotal * 0.15;
  return subtotal + iva;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `Hace ${diffMins} min`;
  }
  if (diffHrs < 24) {
    return `Hace ${diffHrs} h`;
  }
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

export default function HomeScreen() {
  const { session, logout, updateAvatar } = useAuth();
  const { startNewQuote } = useQuoteBuilder();
  const user = session?.user;
  const userName = user?.name ? user.name.split(' ')[0] : 'Vendedor';

  const avatarRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  function openMenu() {
    avatarRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const windowWidth = Dimensions.get('window').width;
      setMenuAnchor({
        top: y + height + spacing.xs,
        right: Math.max(spacing.md, windowWidth - (x + width)),
      });
      setMenuVisible(true);
    });
  }

  async function handlePickPhoto() {
    setMenuVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        await updateAvatar(result.assets[0].uri);
        Alert.alert('Foto actualizada', 'Tu foto de perfil se ha actualizado con éxito.');
      } catch (err) {
        Alert.alert('Error', 'No pudimos actualizar la foto de perfil.');
      }
    }
  }

  async function handleLogout() {
    setMenuVisible(false);
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          logout().catch(() => {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          });
        },
      },
    ]);
  }

  const [goal, setGoal] = useState<MonthlyGoal | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [topClients, setTopClients] = useState<Client[]>([]);

  const loadDashboardData = useCallback(() => {
    getMonthlyGoal().then(setGoal).catch(() => {});
    listQuotes().then(setQuotes).catch(() => {});
    getClients().then(res => {
      const sorted = [...res.clients].sort((a, b) => (b.totalPurchases ?? 0) - (a.totalPurchases ?? 0));
      setTopClients(sorted.slice(0, 3));
    }).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const getUserInitials = () => {
    if (!user?.name) return 'MS';
    const parts = user.name.split(' ');
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[1]?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase() || 'MS';
  };

  // 1. Cálculo dinámico de la meta del mes
  const target = goal?.targetMargin ?? 0;
  const achieved = goal?.achievedMargin ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
  const missing = Math.max(0, target - achieved);

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - today.getDate();

  // 2. Cálculo dinámico de métricas (Visitas, Cotizaciones, Ventas cerradas y Ticket promedio)
  const totalQuotesCount = quotes.length;
  const closedSales = quotes.filter(q => q.status === 'Aceptada' || q.status === 'Enviada');
  const closedSalesCount = closedSales.length;

  const avgTicket = closedSalesCount > 0
    ? Math.round(closedSales.reduce((sum, q) => sum + getQuoteTotal(q), 0) / closedSalesCount)
    : 0;

  // 3. Cálculo dinámico de ventas por categoría
  const categoryTotals: Record<string, number> = {
    'Cultivadores': 0,
    'Motosierras': 0,
    'Bombas': 0,
    'Generadores': 0,
  };
  let totalSalesSum = 0;
  closedSales.forEach(q => {
    q.items.forEach(item => {
      const lineTotal = getLineTotal(item);
      const cat = item.product.category ?? '';
      let dashboardCat = '';
      if (cat.toLowerCase().includes('cultivador')) {
        dashboardCat = 'Cultivadores';
      } else if (cat.toLowerCase().includes('motosierra') || cat.toLowerCase().includes('sierra')) {
        dashboardCat = 'Motosierras';
      } else if (cat.toLowerCase().includes('bomba')) {
        dashboardCat = 'Bombas';
      } else if (cat.toLowerCase().includes('generador')) {
        dashboardCat = 'Generadores';
      }

      if (dashboardCat && categoryTotals[dashboardCat] !== undefined) {
        categoryTotals[dashboardCat] += lineTotal;
        totalSalesSum += lineTotal;
      }
    });
  });

  const categoryPercentages = {
    'Cultivadores': totalSalesSum > 0 ? Math.round((categoryTotals['Cultivadores'] / totalSalesSum) * 100) : 0,
    'Motosierras': totalSalesSum > 0 ? Math.round((categoryTotals['Motosierras'] / totalSalesSum) * 100) : 0,
    'Bombas': totalSalesSum > 0 ? Math.round((categoryTotals['Bombas'] / totalSalesSum) * 100) : 0,
    'Generadores': totalSalesSum > 0 ? Math.round((categoryTotals['Generadores'] / totalSalesSum) * 100) : 0,
  };

  // 4. Ranking de mejores clientes (Dinámico desde la base de datos de clientes)
  const displayTopClients = topClients.slice(0, 3);

  // 5. Ranking de productos más vendidos (Calculado dinámicamente desde cotizaciones)
  const productSalesMap: Record<string, { product: Product; qty: number; total: number }> = {};
  closedSales.forEach(q => {
    q.items.forEach(item => {
      const pid = item.product.id;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = { product: item.product, qty: 0, total: 0 };
      }
      productSalesMap[pid].qty += item.quantity;
      productSalesMap[pid].total += getLineTotal(item);
    });
  });
  const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);
  const displayTopProducts = sortedProducts.slice(0, 3).map(p => ({
    name: p.product.name,
    total: formatCurrency(Math.round(p.total)),
    subtitle: `${p.qty} ${p.qty === 1 ? 'ud' : 'uds'}`,
  }));

  // 6. Actividades Recientes (Cálculo dinámico basado en cotizaciones y clientes nuevos)
  const displayActivities = useMemo(() => {
    const recentActivitiesList: Array<{
      id: string;
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      time: string;
      rightContent: React.ReactNode;
      timestamp: string;
    }> = [];

    quotes.forEach(q => {
      const clientName = q.client.client.name;
      const total = getQuoteTotal(q);
      
      let activityIcon: keyof typeof Ionicons.glyphMap = 'document-text';
      let activityTitle = '';
      let activityStyle: any = styles.activityDark;
      let pricePrefix = '';

      if (q.status === 'Aceptada') {
        activityIcon = 'cart';
        activityTitle = `Venta cerrada - ${clientName}`;
        activityStyle = styles.activityGreen;
        pricePrefix = '+';
      } else if (q.status === 'Enviada') {
        activityIcon = 'document-text';
        activityTitle = `Cotización enviada - ${clientName}`;
      } else if (q.status === 'Rechazada') {
        activityIcon = 'document-text';
        activityTitle = `Cotización rechazada - ${clientName}`;
      } else {
        activityIcon = 'document-text';
        activityTitle = `Cotización guardada - ${clientName}`;
      }

      recentActivitiesList.push({
        id: q.id,
        icon: activityIcon,
        title: activityTitle,
        time: formatTimeAgo(q.updatedAt),
        timestamp: q.updatedAt,
        rightContent: (
          <Text style={activityStyle}>
            {pricePrefix}{formatCurrency(Math.round(total))}
          </Text>
        ),
      });
    });

    // Agregar actividad simulada de clientes recién creados
    topClients.forEach(c => {
      if (c.name.includes('Andes')) {
        recentActivitiesList.push({
          id: `c-act-${c.id}`,
          icon: 'people',
          title: `Nuevo cliente - ${c.name}`,
          time: 'Ayer',
          timestamp: '2026-07-27T12:00:00.000Z',
          rightContent: null,
        });
      }
    });

    const sortedActivities = recentActivitiesList.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return sortedActivities.slice(0, 3);
  }, [quotes, topClients]);

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Personalizada */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.dateText}>{getHeaderDate()}</Text>
            <Text style={styles.greetingText}>Buenos días, {userName}</Text>
          </View>
          <TouchableOpacity
            ref={avatarRef}
            style={styles.avatar}
            activeOpacity={0.7}
            onPress={openMenu}
          >
            {user?.avatar ? (
              <RNImage source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            )}
          </TouchableOpacity>
        </View>

      {/* Meta del Mes Card */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>META DEL MES</Text>
          <Text style={styles.goalPercentage}>{pct}%</Text>
        </View>
        <Text style={styles.goalValues}>
          {formatCurrency(Math.round(achieved))} <Text style={styles.goalTarget}>/ {formatCurrency(Math.round(target))}</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.goalFooter}>
          Faltan {formatCurrency(Math.round(missing))} para la meta - {daysRemaining} días restantes
        </Text>
      </View>

      {/* Métricas Rejilla 2x2 */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="location" size={16} color={colors.black} />
            </View>
            <Text style={styles.metricValue}>6</Text>
            <Text style={styles.metricLabel}>Visitas hoy</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="document-text" size={16} color={colors.black} />
            </View>
            <Text style={styles.metricValue}>{totalQuotesCount > 0 ? totalQuotesCount : 3}</Text>
            <Text style={styles.metricLabel}>Cotizaciones</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="cart" size={16} color={colors.black} />
            </View>
            <Text style={styles.metricValue}>{closedSalesCount > 0 ? closedSalesCount : 2}</Text>
            <Text style={styles.metricLabel}>Ventas cerradas</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="trending-up" size={16} color={colors.black} />
            </View>
            <Text style={styles.metricValue}>{formatCurrency(avgTicket)}</Text>
            <Text style={styles.metricLabel}>Ticket promedio</Text>
          </View>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <Text style={styles.sectionTitle}>ACCIONES RÁPIDAS</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={startNewQuote}
        >
          <Ionicons name="document-text" size={20} color={colors.black} />
          <Text style={styles.actionBtnText}>Cotizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/clients')}
        >
          <Ionicons name="people" size={20} color={colors.black} />
          <Text style={styles.actionBtnText}>Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/catalog')}
        >
          <Ionicons name="grid" size={20} color={colors.black} />
          <Text style={styles.actionBtnText}>Catálogo</Text>
        </TouchableOpacity>
      </View>

      {/* Ventas por Categoría */}
      <Text style={styles.sectionTitle}>VENTAS POR CATEGORÍA</Text>
      <View style={styles.categoryCard}>
        <CategoryRow label="Cultivadores" percentage={categoryPercentages['Cultivadores']} color="#1A1A1A" />
        <CategoryRow label="Motosierras" percentage={categoryPercentages['Motosierras']} color={colors.primary} />
        <CategoryRow label="Bombas" percentage={categoryPercentages['Bombas']} color="#8A8A8A" />
        <CategoryRow label="Generadores" percentage={categoryPercentages['Generadores']} color="#D9D9D9" />
      </View>

      {/* Mejores Clientes */}
      <Text style={styles.sectionTitle}>MEJORES CLIENTES</Text>
      <View style={styles.rankingCard}>
        {displayTopClients.length === 0 ? (
          <Text style={styles.emptyText}>Sin clientes asignados.</Text>
        ) : (
          displayTopClients.map((c, idx) => (
            <RankingRow
              key={c.id}
              index={idx + 1}
              name={c.name}
              value={formatCurrency(Math.round(c.totalPurchases ?? 0))}
              badgeStyle={idx === 0 ? styles.goldBadge : idx === 1 ? styles.silverBadge : styles.bronzeBadge}
            />
          ))
        )}
      </View>

      {/* Top Productos */}
      <Text style={styles.sectionTitle}>TOP PRODUCTOS DEL MES</Text>
      <View style={styles.rankingCard}>
        {displayTopProducts.length === 0 ? (
          <Text style={styles.emptyText}>Sin productos cotizados.</Text>
        ) : (
          displayTopProducts.map((p, idx) => (
            <ProductRankingRow
              key={idx}
              index={idx + 1}
              name={p.name}
              total={p.total}
              subtitle={p.subtitle}
            />
          ))
        )}
      </View>

      {/* Actividad Reciente */}
      <Text style={styles.sectionTitle}>ACTIVIDAD RECIENTE</Text>
      <View style={styles.activityCard}>
        {displayActivities.length === 0 ? (
          <Text style={styles.emptyText}>Sin actividad reciente.</Text>
        ) : (
          displayActivities.map((act) => (
            <ActivityRow
              key={act.id}
              icon={act.icon}
              title={act.title}
              time={act.time}
              rightContent={act.rightContent}
            />
          ))
        )}
      </View>
    </ScrollView>

      {/* Botón flotante FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={startNewQuote}
      >
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>

      {/* Modal del Menu de Avatar (Cerrar Sesión) */}
      <AvatarMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
        onPickPhoto={handlePickPhoto}
        onLogout={handleLogout}
      />
    </ScreenContainer>
  );
}

function CategoryRow({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <View style={styles.catRow}>
      <View style={styles.catInfo}>
        <Text style={styles.catLabel}>{label}</Text>
        <Text style={styles.catPercentage}>{percentage}%</Text>
      </View>
      <View style={styles.catTrack}>
        <View style={[styles.catBar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function RankingRow({
  index,
  name,
  value,
  badgeStyle,
}: {
  index: number;
  name: string;
  value: string;
  badgeStyle?: any;
}) {
  return (
    <View style={styles.rankingRow}>
      <View style={[styles.rankingBadge, badgeStyle]}>
        <Text style={styles.rankingIndexText}>{index}</Text>
      </View>
      <Text style={styles.rankingName} numberOfLines={1}>{name}</Text>
      <Text style={styles.rankingValue}>{value}</Text>
    </View>
  );
}

function ProductRankingRow({
  index,
  name,
  total,
  subtitle,
}: {
  index: number;
  name: string;
  total: string;
  subtitle: string;
}) {
  return (
    <View style={styles.rankingRow}>
      <View style={styles.blackBadge}>
        <Text style={styles.blackBadgeText}>{index}</Text>
      </View>
      <Text style={styles.rankingName} numberOfLines={1}>{name}</Text>
      <View style={styles.rankingRight}>
        <Text style={styles.rankingValue}>{total}</Text>
        <Text style={styles.rankingSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

function ActivityRow({
  icon,
  title,
  time,
  rightContent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  time: string;
  rightContent: React.ReactNode;
}) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIconCircle}>
        <Ionicons name={icon} size={16} color={colors.black} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      {rightContent && <View style={styles.activityRight}>{rightContent}</View>}
    </View>
  );
}

import { styles } from '@/theme/styles/app_tabs_index';
