import { StyleSheet } from 'react-native';

/** Estilos centralizados. Uso: src/components/common/SalesLoadingScreen.tsx. */
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Fondo oscuro
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  spacer: {
    height: 40,
  },
  centerSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 40,
  },
  // Contenedor del grupo de logo y brillo para animar escala en conjunto
  logoGroupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 320,
    height: 120,
    marginBottom: 48,
    position: 'relative',
  },
  // Contenedor del brillo difuminado
  glowWrapper: {
    position: 'absolute',
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  glowImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    width: 210,
    height: 210 / 2.6, // Ajustado a la relaciÃ³n de aspecto original (224x86 -> 2.6) para evitar deformaciÃ³n
    zIndex: 2,
  },
  // Barra de progreso horizontal
  progressBarContainer: {
    width: '80%',
    maxWidth: 280,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A3A3A', // Gris oscuro
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#EBD600', // Amarillo institucional
  },
  messageText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 14,
    color: '#D9D9D9', // Blanco grisÃ¡ceo elegante
    textAlign: 'center',
    marginTop: 8,
  },
  footerContainer: {
    paddingBottom: 24,
  },
  footerText: {
    fontFamily: 'Barlow_600SemiBold',
    fontSize: 13,
    color: '#8A8A8A', // Gris suave
    textAlign: 'center',
  },
});
