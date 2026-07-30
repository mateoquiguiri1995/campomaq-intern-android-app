import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { QuoteStatus } from '@/features/quotes/types';
import { colors } from '@/theme/colors';

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: QuoteStatus | null;
  onCancel: () => void;
  onConfirm: (status: QuoteStatus) => void;
}

const AVAILABLE_STATUSES: QuoteStatus[] = ['Aceptada', 'Rechazada'];

export function StatusPickerModal({
  visible,
  currentStatus,
  onCancel,
  onConfirm,
}: StatusPickerModalProps) {
  const getStatusStyles = (status: QuoteStatus) => {
    switch (status) {
      case 'Aceptada':
        return { bg: '#E6F4EA', text: '#137333' };
      case 'Rechazada':
        return { bg: '#FCE8E6', text: '#C5221F' };
      case 'Pendiente':
        return { bg: '#FEF7E0', text: '#B06000' };
      default: // Enviada
        return { bg: '#F5F5F5', text: '#666666' };
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Cambiar estado de cotización</Text>
            <Text style={styles.subtitle}>Selecciona el nuevo estado para este documento:</Text>
          </View>

          <View style={styles.optionsContainer}>
            {AVAILABLE_STATUSES.map((status) => {
              const statusStyle = getStatusStyles(status);
              const isSelected = currentStatus === status;

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: statusStyle.text, borderWidth: 1.5 }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => onConfirm(status)}
                >
                  <View style={styles.optionHeader}>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                        {status}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color={statusStyle.text} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  optionsContainer: {
    gap: 12,
    marginVertical: 8,
  },
  optionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
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
