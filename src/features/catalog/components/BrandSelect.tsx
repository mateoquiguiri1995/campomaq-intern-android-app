import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface BrandSelectProps {
  brands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

/**
 * Selector de marca del catálogo.
 * Un dropdown compacto (no una lista de chips) para no restarle
 * espacio vertical a las tarjetas de producto.
 */
export function BrandSelect({
  brands,
  selectedBrand,
  onSelectBrand,
}: BrandSelectProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // "Todas" + una sola marca real no amerita filtro.
  if (brands.length <= 2) {
    return null;
  }

  const isFiltered = selectedBrand !== 'Todas';

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, isFiltered && styles.triggerActive]}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
      >
        <Ionicons
          name="funnel"
          size={18}
          color={isFiltered ? colors.black : '#FFFFFF'}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
            onPress={() => {
              // Evita que el toque se propague al backdrop y cierre el sheet.
            }}
          >
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>Filtrar por marca</Text>

            <FlatList
              data={brands}
              keyExtractor={(item) => item}
              style={styles.sheetList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => {
                const selected = item === selectedBrand;

                return (
                  <TouchableOpacity
                    style={styles.option}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectBrand(item);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primaryDark}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  triggerActive: {
    backgroundColor: colors.primary,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    maxHeight: '60%',
  },

  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },

  sheetTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.xs,
  },

  sheetList: {
    flexGrow: 0,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + spacing.xs,
  },

  optionText: {
    ...typography.body,
    color: colors.black,
  },

  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
