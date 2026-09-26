import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ProductList } from '@/features/catalog/components/ProductList';
import { SearchSuggestionsPanel } from '@/features/catalog/components/SearchSuggestionsPanel';
import { useCatalog } from '@/features/catalog/hooks/useCatalog';
import { useSearchFieldFocus } from '@/features/catalog/hooks/useSearchFieldFocus';
import type { Product } from '@/features/catalog/types';
import { QuoteItemEditorModal } from '@/features/quotes/components/QuoteItemEditorModal';
import { useQuoteBuilder } from '@/features/quotes/QuoteBuilderProvider';
import { getQuoteTotals } from '@/features/quotes/services/quoteCalculations';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/app_quotes_select-products';
import { formatCurrency } from '@/utils/currency';

/** Paso 2 del flujo de cotización: elegir productos del catálogo y añadirlos. */
export default function SelectProductsScreen() {
  const router = useRouter();
  const { items, addItem } = useQuoteBuilder();

  const {
    products,
    loading,
    searchLoading,
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
    hasMore,
    loadMore,
    hasActiveFilters,
    resetFilters,
  } = useCatalog();

  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);

  const {
    inputRef: searchInputRef,
    focused: searchFocused,
    onFocus: handleSearchFocus,
    onBlur: handleSearchBlur,
    dismiss: dismissSearch,
  } = useSearchFieldFocus();
  // Borde inferior de la barra de búsqueda: ahí se ancla el panel de sugerencias.
  const [searchPanelTop, setSearchPanelTop] = useState(52);

  const currentItem = pickerProduct ? items.find((item) => item.product.id === pickerProduct.id) : undefined;
  const { total } = getQuoteTotals(items);

  function handleSubmitSearch(term?: string) {
    submitSearch(term);
    dismissSearch();
  }

  function handleSelectSuggestion(product: Product) {
    selectSuggestion(product);
    dismissSearch();
  }

  function handleClearSearch() {
    setSearch('');
  }

  return (
    <ScreenContainer scroll={false}>
      <Stack.Screen options={{ title: 'Elegir productos', headerBackTitle: 'Cliente' }} />

      {/* Área de búsqueda: incluye el listado para que el panel de sugerencias pueda superponerse */}
      <View style={styles.searchArea}>
        {/* Barra de Búsqueda con Botón y Efecto de Carga */}
        <View
          style={styles.searchContainer}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setSearchPanelTop(y + height + 6);
          }}
        >
          <View style={styles.searchRow}>
            <View style={styles.searchBarWrapper}>
              {searchLoading ? (
                <ActivityIndicator size="small" color={colors.primaryDark} style={styles.searchIcon} />
              ) : (
                <Ionicons name="search" size={18} color={colors.gray} style={styles.searchIcon} />
              )}

              <TextInput
                style={styles.searchInput}
                placeholder="Buscar producto por nombre o código"
                placeholderTextColor={colors.gray}
                value={search}
                onChangeText={setSearch}
                ref={searchInputRef}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                returnKeyType="search"
                onSubmitEditing={() => handleSubmitSearch()}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  style={styles.clearIcon}
                  onPress={handleClearSearch}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.gray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Botón de Búsqueda explícito */}
            <TouchableOpacity
              style={[
                styles.searchButton,
                searchLoading && styles.searchButtonLoading,
              ]}
              onPress={() => handleSubmitSearch()}
              disabled={searchLoading && search.trim() === submittedSearch}
              activeOpacity={0.8}
            >
              {searchLoading ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <>
                  <Ionicons name="search" size={16} color={colors.onPrimary} />
                  <Text style={styles.searchButtonText}>Buscar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primaryDark} />
          </View>
        )}

        {!loading && (
          <View style={[styles.listWrapper, searchLoading && styles.listWrapperDimmed]}>
            <ProductList
              products={products}
              onLoadMore={loadMore}
              hasMore={hasMore}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={resetFilters}
              onPressProduct={setPickerProduct}
              searching={searchLoading}
            />
          </View>
        )}

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

      {items.length > 0 && (
        <View style={styles.summaryBar}>
          <View>
            <Text style={styles.summaryCount}>{items.length} producto(s) añadido(s)</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryButton}>
            <Button label="Ver cotización" onPress={() => router.push('/quotes/summary')} />
          </View>
        </View>
      )}

      <QuoteItemEditorModal
        visible={!!pickerProduct}
        product={pickerProduct}
        initial={currentItem}
        onCancel={() => setPickerProduct(null)}
        onConfirm={(values) => {
          if (pickerProduct) addItem(pickerProduct, values);
          setPickerProduct(null);
        }}
      />
    </ScreenContainer>
  );
}
