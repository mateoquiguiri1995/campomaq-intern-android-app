import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type SortCriteria = 'margin' | 'price_asc' | 'price_desc' | 'name';

interface SortOption {
  key: SortCriteria;
  label: string;
}

const OPTIONS: SortOption[] = [
  { key: 'margin', label: 'Margen (Mayor a menor)' },
  { key: 'price_asc', label: 'Precio (Menor a mayor)' },
  { key: 'price_desc', label: 'Precio (Mayor a menor)' },
  { key: 'name', label: 'Nombre (A-Z)' },
];

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: SortCriteria;
  onSelect: (criterion: SortCriteria) => void;
}

export function SortModal({
  visible,
  onClose,
  sortBy,
  onSelect,
}: SortModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Ordenar productos</Text>
          <Text style={styles.subtitle}>Selecciona el criterio de ordenamiento:</Text>
          
          <View style={styles.optionsList}>
            {OPTIONS.map((opt) => {
              const isActive = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.option, isActive && styles.optionActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#1A1A1A" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: -4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: -8,
  },
  optionsList: {
    gap: 8,
    marginVertical: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  optionActive: {
    backgroundColor: '#FFF9E6',
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  optionTextActive: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
