import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { styles } from '@/theme/styles/src_components_common_UserAvatar';

export interface UserAvatarProps {
  /** Tamaño del botón de avatar en cabecera (por defecto: 44). */
  size?: number;
  /** Estilo adicional para el contenedor del avatar. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Avatar de usuario interactivo.
 * Al presionarlo, se despliega suavemente al centro de la pantalla
 * con la imagen ampliada, detalles del perfil y el botón de salir abajo.
 */
export function UserAvatar({ size = 44, style }: UserAvatarProps) {
  const { session, logout, updateAvatar } = useAuth();
  const user = session?.user;

  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [animProgress] = useState(() => new Animated.Value(0));
  // Confirmación visual (sin alertas) tras cambiar la foto.
  const [photoFeedback, setPhotoFeedback] = useState<'success' | 'error' | null>(null);
  const [feedbackProgress] = useState(() => new Animated.Value(0));
  const [feedbackRing] = useState(() => new Animated.Value(0));

  // Iniciales del usuario
  const initials = (() => {
    if (!user?.name?.trim()) return 'V';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, Math.min(2, parts[0].length)).toUpperCase();
  })();

  function openModal() {
    setModalVisible(true);
    Animated.spring(animProgress, {
      toValue: 1,
      friction: 7,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }

  function closeModal() {
    Animated.timing(animProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setConfirmingLogout(false);
      setIsLoggingOut(false);
    });
  }

  /**
   * Check (o cruz) que aparece sobre la foto con un rebote suave, un anillo
   * que se expande alrededor y luego se desvanece dejando ver la foto nueva.
   */
  function playPhotoFeedback(kind: 'success' | 'error') {
    feedbackProgress.stopAnimation();
    feedbackRing.stopAnimation();
    feedbackProgress.setValue(0);
    feedbackRing.setValue(0);
    setPhotoFeedback(kind);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(feedbackProgress, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(feedbackProgress, {
          toValue: 2,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(feedbackRing, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setPhotoFeedback(null);
    });
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Necesitamos acceso a tus fotos para cambiar el avatar de tu perfil.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const pickedUri = result.assets?.[0]?.uri;
    if (!result.canceled && pickedUri) {
      try {
        setIsUpdatingPhoto(true);
        await updateAvatar(pickedUri);
        playPhotoFeedback('success');
      } catch {
        playPhotoFeedback('error');
      } finally {
        setIsUpdatingPhoto(false);
      }
    }
  }

  async function handleConfirmLogout() {
    try {
      setIsLoggingOut(true);
      closeModal();
      await logout();
    } catch {
      setIsLoggingOut(false);
      setConfirmingLogout(false);
    }
  }

  const cardScale = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  const cardTranslateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const cardOpacity = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.8, 1],
  });

  const backdropOpacity = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // 0 → 1: aparece con rebote; 1 → 2: se desvanece agrandándose apenas.
  const feedbackOpacity = feedbackProgress.interpolate({
    inputRange: [0, 0.6, 1, 2],
    outputRange: [0, 1, 1, 0],
  });
  const feedbackIconScale = feedbackProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.3, 1, 1.12],
  });
  const ringScale = feedbackRing.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const ringOpacity = feedbackRing.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.9, 0],
  });
  const feedbackColor = photoFeedback === 'error' ? colors.danger : colors.success;

  return (
    <>
      {/* Botón Avatar en Cabecera */}
      <TouchableOpacity
        style={[
          styles.triggerButton,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
        activeOpacity={0.8}
        onPress={openModal}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.triggerImage} resizeMode="cover" />
        ) : (
          <Text style={[styles.triggerText, { fontSize: Math.round(size * 0.35) }]}>
            {initials}
          </Text>
        )}
      </TouchableOpacity>

      {/* Modal Desplegable al Centro del Dispositivo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {/* Fondo desenfocado/oscurecido con animación */}
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={styles.backdropPressable} onPress={closeModal} />
          </Animated.View>

          {/* Tarjeta Centrada Desplegada */}
          <Animated.View
            style={[
              styles.dialogCard,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
              },
            ]}
          >
            {/* Fila superior con etiqueta y botón cerrar */}
            <View style={styles.cardTopRow}>
              <Text style={styles.cardLabel}>Mi Perfil</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={colors.grayDark} />
              </TouchableOpacity>
            </View>

            {/* Avatar Grande Central con Botón de Cámara */}
            <View style={styles.largeAvatarWrapper}>
              {photoFeedback && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.feedbackRing,
                    { borderColor: feedbackColor, opacity: ringOpacity, transform: [{ scale: ringScale }] },
                  ]}
                />
              )}

              <View style={styles.largeAvatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.largeAvatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.largeAvatarText}>{initials}</Text>
                )}

                {photoFeedback && (
                  <Animated.View
                    pointerEvents="none"
                    accessibilityLiveRegion="polite"
                    accessibilityLabel={
                      photoFeedback === 'success' ? 'Foto actualizada' : 'No se pudo actualizar la foto'
                    }
                    style={[styles.feedbackOverlay, { backgroundColor: feedbackColor, opacity: feedbackOpacity }]}
                  >
                    <Animated.View style={{ transform: [{ scale: feedbackIconScale }] }}>
                      <Ionicons
                        name={photoFeedback === 'success' ? 'checkmark' : 'close'}
                        size={52}
                        color="#FFFFFF"
                      />
                    </Animated.View>
                  </Animated.View>
                )}
              </View>

              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                onPress={handlePickPhoto}
                disabled={isUpdatingPhoto}
              >
                {isUpdatingPhoto ? (
                  <ActivityIndicator size="small" color="#1A1A1A" />
                ) : (
                  <Ionicons name="camera" size={17} color="#1A1A1A" />
                )}
              </TouchableOpacity>
            </View>

            {/* Datos del Usuario */}
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Vendedor'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'vendedor@campomaq.ec'}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#874D00" />
              <Text style={styles.roleBadgeText}>
                {user?.role === 'vendedor' ? 'Asesor Comercial' : (user?.role || 'Vendedor')}
              </Text>
            </View>

            {/* Acciones y Botón de Salir Abajo */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.changePhotoButton}
                activeOpacity={0.7}
                onPress={handlePickPhoto}
                disabled={isUpdatingPhoto}
              >
                <Ionicons name="camera-outline" size={18} color={colors.black} />
                <Text style={styles.changePhotoText}>
                  {isUpdatingPhoto ? 'Actualizando foto...' : 'Cambiar foto de perfil'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Botón de Salir abajo (con confirmación en el mismo elemento) */}
              {!confirmingLogout ? (
                <TouchableOpacity
                  style={styles.logoutButton}
                  activeOpacity={0.7}
                  onPress={() => setConfirmingLogout(true)}
                >
                  <Ionicons name="log-out-outline" size={19} color={colors.danger} />
                  <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.confirmLogoutContainer}>
                  <Text style={styles.confirmLogoutText}>¿Estás seguro de que deseas salir?</Text>
                  <View style={styles.confirmButtonsRow}>
                    <TouchableOpacity
                      style={styles.cancelLogoutButton}
                      activeOpacity={0.7}
                      onPress={() => setConfirmingLogout(false)}
                      disabled={isLoggingOut}
                    >
                      <Text style={styles.cancelLogoutText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmLogoutButton}
                      activeOpacity={0.7}
                      onPress={handleConfirmLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.confirmLogoutButtonText}>Sí, salir</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
