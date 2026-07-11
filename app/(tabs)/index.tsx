import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/components/common/AppHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  image: any;
  route: '/catalog' | '/clients' | '/reports';
  color: string;
}

export default function HomeScreen() {
  const { session, logout } = useAuth();
  const user = session?.user;

  // Cards del dashboard
  const dashboardCards: DashboardCard[] = [
    {
      id: 'products',
      title: 'Productos',
      description: 'Consulta el catálogo, precios y stock.',
      icon: 'grid-outline',
      image: require('@/assets/images/dashboard/products-bg.jpg'),
      route: '/catalog',
      color: colors.primary,
    },
    {
      id: 'clients',
      title: 'Clientes',
      description: 'Busca clientes y sus datos de contacto.',
      icon: 'people-outline',
      image: require('@/assets/images/dashboard/clients-bg.jpg'),
      route: '/clients',
      color: colors.primary,
    },
    {
      id: 'quotes',
      title: 'Cotizaciones',
      description: 'Genera proformas en PDF.',
      icon: 'document-text-outline',
      image: require('@/assets/images/dashboard/quotes-bg.jpg'),
      route: '/reports',
      color: colors.primary,
    },
  ];

  const handleCardPress = (route: DashboardCard['route']) => {
    router.push(route);
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={`Hola, ${user?.name || 'Vendedor'}`}
        subtitle="¿Qué necesitas hoy?"
      />

      <View style={styles.cardsContainer}>
        {dashboardCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardWrapper}
            onPress={() => handleCardPress(card.route)}
            activeOpacity={0.85}
          >
            <View style={styles.card}>
              {/* Imagen de fondo */}
              <Image
                source={card.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              
              {/* Overlay oscuro para legibilidad */}
              <View style={styles.cardOverlay} />
              
              {/* Contenido */}
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                  <Ionicons name={card.icon} size={24} color="#050505" />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    flex: 1,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cardWrapper: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});