import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const user = session?.user;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'V'}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>{user?.name || 'Vendedor'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'vendedor@campomaq.ec'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || 'Vendedor'}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color={colors.black} />
          <Text style={styles.menuText}>Datos personales</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} style={styles.menuArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={20} color={colors.black} />
          <Text style={styles.menuText}>Configuración</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} style={styles.menuArrow} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color={colors.black} />
          <Text style={styles.menuText}>Ayuda</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} style={styles.menuArrow} />
        </TouchableOpacity>
      </View>

      <View style={styles.logoutContainer}>
        <Button
          label="Cerrar sesión"
          variant="ghost"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
          onPress={logout}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '600',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.title,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  userName: {
    ...typography.subtitle,
    color: colors.black,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  roleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    ...typography.body,
    color: colors.black,
    marginLeft: spacing.md,
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  logoutContainer: {
    marginTop: 'auto',
    paddingVertical: spacing.md,
  },
});