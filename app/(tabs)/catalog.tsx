import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/features/auth/AuthProvider';
import { BrandSelect } from '@/features/catalog/components/BrandSelect';
import { CategoryChip } from '@/features/catalog/components/CategoryChip';
import { MonthlyGoalCard } from '@/features/catalog/components/MonthlyGoalCard';
import { ProductList } from '@/features/catalog/components/ProductList';
import { SearchSuggestionsPanel } from '@/features/catalog/components/SearchSuggestionsPanel';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import { useSearchFieldFocus } from '@/features/catalog/hooks/useSearchFieldFocus';
import type { Product } from '@/features/catalog/types';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { useSellerDashboard } from '@/features/sellers/SellerProvider';
import { colors } from '@/theme/colors';

export default function CatalogScreen() {
  const router = useRouter();
  const { seller } = useSellerDashboard();
  const { session } = useAuth();
  const user = session?.user;
  const { resetBuilder } = useQuoteBuilder();
  const sellerGoal = seller
    ? {
        achievedMargin: seller.currentMonthSales,
        targetMargin: seller.monthlyGoal,
        percentage: seller.monthlyGoal > 0 ? (seller.currentMonthSales / seller.monthlyGoal) * 100 : 0,
      }
    : null;
  const leadingCategory = seller?.salesByCategory[0];

  function handleNewQuote() {
    resetBuilder();
    router.push('/quotes/select-client');
  }

  const {
    products,
    totalProducts,
    loading,
    searchLoading,
    error,
    hasProducts,

    search,
    setSearch,
    submittedSearch,
    submitSearch,
    selectSuggestion,
    searchSuggestions,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    isOffline,

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
    refresh,
    refreshing,
  } = useCatalog();

  const {
    inputRef: searchInputRef,
    focused: searchFocused,
    onFocus: handleSearchFocus,
    onBlur: handleSearchBlur,
    dismiss: dismissSearch,
  } = useSearchFieldFocus();
  // Borde inferior de la barra de búsqueda: ahí se ancla el panel de sugerencias.
  const [searchPanelTop, setSearchPanelTop] = useState(54);

  function handleSubmitSearch(term?: string) {
    submitSearch(term);
    dismissSearch();
  }

  function handleSelectSuggestion(product: Product) {
    selectSuggestion(product);
    dismissSearch();
  }


  const getUserFirstName = () => {
    if (!user?.name) return 'Vendedor';
    return user.name.split(' ')[0].toUpperCase();
  };

  const handleOpenProduct = useCallback(
    (product: Product) => {
      router.push({
        pathname: '/product/[id]',
        params: { id: product.id, data: JSON.stringify(product) },
      });
    },
    [router]
  );

  function handleBellPress() {
    Alert.alert('Próximamente', 'Las notificaciones estarán disponibles en una próxima actualización.');
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false} edges={['top']} style={styles.screenContent}>
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
      <ScreenContainer scroll={false} edges={['top']} style={styles.screenContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
            <Text style={styles.headerTitle}>Catálogo</Text>
          </View>
        </View>

        <View style={styles.center}>
          <Text style={styles.errorTitle}>No pudimos cargar el catálogo</Text>
          <Text style={styles.message}>{error}</Text>
          <Button label="Reintentar" variant="ghost" onPress={refresh} />
        </View>
      </ScreenContainer>
    );
  }

  if (!hasProducts) {
    return (
      <ScreenContainer scroll={false} edges={['top']} style={styles.screenContent}>
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
    <ScreenContainer scroll={false} edges={['top']} style={styles.screenContent}>
      {/* Cabecera Premium de mockup */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.helloText}>HOLA, {getUserFirstName()}</Text>
          <Text style={styles.headerTitle}>Catálogo</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7} onPress={handleBellPress}>
            <Ionicons name="notifications" size={20} color={colors.black} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <UserAvatar size={44} />
        </View>
      </View>

      {/* Área de búsqueda: incluye el listado para que el panel de sugerencias pueda superponerse */}
      <View style={styles.searchArea}>
        {/* Contenedor Agrupado de Búsqueda, Filtros y Meta */}
        <View style={styles.topControlsGroup}>
          {/* Fila de Búsqueda y Filtro de Marca */}
          <View
            style={styles.searchRow}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              setSearchPanelTop(y + height + 6);
            }}
          >
            <View style={styles.searchBarWrapper}>
              {searchLoading ? (
                <ActivityIndicator size="small" color={colors.gray} style={styles.searchIcon} />
              ) : (
                <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
              )}

              <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto por nombre"
                placeholderTextColor={colors.gray}
                value={search}
                onChangeText={setSearch}
                ref={searchInputRef}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmitEditing={() => handleSubmitSearch()}
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
          <MonthlyGoalCard goal={sellerGoal} />


          {/* Fila de Contador */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLeftText} numberOfLines={1}>
              {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
              {submittedSearch ? ` para “${submittedSearch}”` : ''}
            </Text>
          </View>
        </View>

        {/* Listado de Productos */}
        <ProductList
          products={products}
          hasMore={hasMore}
          onLoadMore={loadMore}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={resetFilters}
          onPressProduct={handleOpenProduct}
          searching={searchLoading}
          refreshing={refreshing}
          onRefresh={refresh}
        />

        {searchFocused && (
          <SearchSuggestionsPanel
            top={searchPanelTop}
            query={search}
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
            isOffline={isOffline}
            onSelectSuggestion={handleSelectSuggestion}
            onSelectRecent={handleSubmitSearch}
            onRemoveRecent={removeRecentSearch}
            onClearRecents={clearRecentSearches}
            onDismiss={dismissSearch}
          />
        )}
      </View>



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

import { styles } from '@/theme/styles/app_tabs_catalog';

