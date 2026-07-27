import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image as RNImage,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScreenContainer } from '@/components/common/ScreenContainer';
import { BrandSelect } from '@/features/catalog/components/BrandSelect';
import { CategoryChip } from '@/features/catalog/components/CategoryChip';
import { MonthlyGoalCard } from '@/features/catalog/components/MonthlyGoalCard';
import { ProductList } from '@/features/catalog/components/ProductList';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import { useMonthlyGoal } from '@/features/catalog/hooks/useMonthlyGoal';
import type { Product } from '@/features/catalog/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';

type SortType = 'margin' | 'price_asc' | 'price_desc' | 'name';

export default function CatalogScreen() {
  const router = useRouter();
  const { goal } = useMonthlyGoal();
  const { session, logout, updateAvatar } = useAuth();
  const user = session?.user;
  const { resetBuilder } = useQuoteBuilder();

  function handleNewQuote() {
    resetBuilder();
    router.push('/quotes/select-client');
  }

  // Estados para el menu de avatar
  const avatarRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  // Ordenamiento local
  const [sortBy, setSortBy] = useState<SortType>('margin');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const {
    products,
    totalProducts,
    loading,
    searchLoading,
    error,
    hasProducts,

    search,
    setSearch,

    categories,
    selectedCategory,
    setSelectedCategory,

    brands,
    selectedBrand,
    setSelectedBrand,

    hasMore,
    loadMore,

    hasActiveFilters,
    resetFilters,
  } = useCatalog();

  // Ordenar productos localmente
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'margin') {
      return list.sort((a, b) => (b.marginPct ?? 0) - (a.marginPct ?? 0));
    }
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.priceA - b.priceA);
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.priceA - a.priceA);
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

  const getSortLabel = () => {
    if (sortBy === 'margin') return 'margen';
    if (sortBy === 'price_asc') return 'precio (menor a mayor)';
    if (sortBy === 'price_desc') return 'precio (mayor a menor)';
    return 'nombre';
  };

  const getSortButtonText = () => {
    if (sortBy === 'margin') return 'Margen';
    if (sortBy === 'price_asc' || sortBy === 'price_desc') return 'Precio';
    return 'Nombre';
  };

  function handleSortPress() {
    setSortModalVisible(true);
  }

  // Menu de avatar
  function openMenu() {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
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
      quality: 0.7,
    });

    const pickedUri = result.assets?.[0]?.uri;
    if (!result.canceled && pickedUri) {
      await updateAvatar(pickedUri);
    }
  }

  async function handleLogout() {
    setMenuVisible(false);
    await logout();
  }

  const getInitial = () => {
    if (!user?.name) return 'MS';
    const names = user.name.split(' ');
    return names.length > 1
      ? names[0].charAt(0) + names[1].charAt(0)
      : names[0].charAt(0);
  };

  const getUserFirstName = () => {
    if (!user?.name) return 'Vendedor';
    return user.name.split(' ')[0].toUpperCase();
  };

  function handleOpenProduct(product: Product) {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id, data: JSON.stringify(product) },
    });
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        {/* Cabecera Mock */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
            <Text style={styles.headerTitle}>Catálogo</Text>
          </View>
        </View>

        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.message}>Cargando catálogo...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
            <Text style={styles.headerTitle}>Catálogo</Text>
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.errorTitle}>No pudimos cargar el catálogo</Text>
          <Text style={styles.message}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!hasProducts) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
            <Text style={styles.headerTitle}>Catálogo</Text>
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.message}>No existen productos disponibles.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      {/* Cabecera Premium de mockup */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
          <Text style={styles.headerTitle}>Catálogo</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Ionicons name="notifications" size={20} color={colors.black} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <TouchableOpacity
            ref={avatarRef}
            style={styles.avatarButton}
            onPress={openMenu}
            activeOpacity={0.7}
          >
            {user?.avatar ? (
              <RNImage source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>{getInitial()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor Agrupado de Búsqueda, Filtros y Meta */}
      <View style={styles.topControlsGroup}>
        {/* Fila de Búsqueda y Filtro de Marca */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarWrapper}>
            {searchLoading ? (
              <ActivityIndicator size="small" color={colors.gray} style={styles.searchIcon} />
            ) : (
              <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
            )}

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto, código..."
              placeholderTextColor={colors.gray}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />

            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearIcon}
                onPress={() => setSearch('')}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          <BrandSelect
            brands={brands}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
          />
        </View>

        {/* Categorías scroll horizontal */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            style={styles.chipsScroll}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                selected={category === selectedCategory}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Barra de progreso de Meta del Mes */}
        <MonthlyGoalCard goal={goal} />

        {/* Fila de Contador y Selector de Ordenamiento */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLeftText}>
            {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'} · ordenado por {getSortLabel()}
          </Text>
          <TouchableOpacity style={styles.sortRightBtn} activeOpacity={0.7} onPress={handleSortPress}>
            <Text style={styles.sortRightText}>{getSortButtonText()}</Text>
            <Ionicons name="arrow-down" size={12} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de Productos */}
      <ProductList
        products={sortedProducts}
        hasMore={hasMore}
        onLoadMore={loadMore}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={resetFilters}
        onPressProduct={handleOpenProduct}
        searching={searchLoading}
      />

      {/* Modal del Menu de Avatar (Cerrar Sesión) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { top: menuAnchor.top, right: menuAnchor.right }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePickPhoto} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={18} color={colors.black} />
              <Text style={styles.menuItemText}>Cambiar foto</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de Ordenamiento (Bottom Sheet) */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.sortBackdrop} onPress={() => setSortModalVisible(false)}>
          <View style={styles.sortSheet}>
            <View style={styles.sortSheetHandle} />
            <Text style={styles.sortSheetTitle}>Ordenar productos</Text>
            <Text style={styles.sortSheetSubtitle}>Selecciona el criterio de ordenamiento:</Text>
            
            <View style={styles.sortOptionsList}>
              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'margin' && styles.sortOptionActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setSortBy('margin');
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'margin' && styles.sortOptionTextActive]}>
                  Margen (Mayor a menor)
                </Text>
                {sortBy === 'margin' && <Ionicons name="checkmark" size={18} color="#1A1A1A" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'price_asc' && styles.sortOptionActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setSortBy('price_asc');
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'price_asc' && styles.sortOptionTextActive]}>
                  Precio (Menor a mayor)
                </Text>
                {sortBy === 'price_asc' && <Ionicons name="checkmark" size={18} color="#1A1A1A" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'price_desc' && styles.sortOptionActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setSortBy('price_desc');
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'price_desc' && styles.sortOptionTextActive]}>
                  Precio (Mayor a menor)
                </Text>
                {sortBy === 'price_desc' && <Ionicons name="checkmark" size={18} color="#1A1A1A" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortOption, sortBy === 'name' && styles.sortOptionActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setSortBy('name');
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === 'name' && styles.sortOptionTextActive]}>
                  Nombre (A-Z)
                </Text>
                {sortBy === 'name' && <Ionicons name="checkmark" size={18} color="#1A1A1A" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sortCancelBtn}
              activeOpacity={0.7}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.sortCancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* Botón flotante FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={handleNewQuote}
      >
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    gap: 2,
  },
  helloText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 13,
    right: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
  },
  searchBarWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm + spacing.xs,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#FAFAFA',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingLeft: spacing.xl + spacing.xs,
    paddingRight: spacing.xl,
    height: 48,
    fontSize: 14,
    color: colors.black,
  },
  clearIcon: {
    position: 'absolute',
    right: spacing.sm + spacing.xs,
  },
  filtersWrapper: {
    marginBottom: 0,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsRow: {
    gap: spacing.xs + 2,
    paddingRight: spacing.md,
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  topControlsGroup: {
    gap: 6,
  },
  sortLeftText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  sortRightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sortRightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.grayDark,
  },
  errorTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#D32F2F',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menu: {
    position: 'absolute',
    minWidth: 190,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuItemText: {
    ...typography.body,
    color: colors.black,
  },
  menuItemDanger: {
    color: colors.danger,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  sortBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  sortSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5E5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sortSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sortSheetSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  sortOptionsList: {
    gap: 2,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#F5F5F5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  sortCancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sortCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
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
