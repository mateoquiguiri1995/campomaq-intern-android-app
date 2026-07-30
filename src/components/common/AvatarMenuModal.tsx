import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface AvatarMenuModalProps {
  visible: boolean;
  onClose: () => void;
  anchor: { top: number; right: number };
  onPickPhoto: () => void;
  onLogout: () => void;
}

export function AvatarMenuModal({
  visible,
  onClose,
  anchor,
  onPickPhoto,
  onLogout,
}: AvatarMenuModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { top: anchor.top, right: anchor.right }]}>
          <TouchableOpacity style={styles.menuItem} onPress={onPickPhoto} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={18} color={colors.black} />
            <Text style={styles.menuItemText}>Cambiar foto</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={[styles.menuItemText, styles.menuItemDanger]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
