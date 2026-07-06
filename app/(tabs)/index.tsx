import { AppHeader } from '@/components/common/AppHeader';
import { PlaceholderCard } from '@/components/common/PlaceholderCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';

/**
 * Pestaña Inicio: dashboard mínimo.
 *
 * TODO(Futuro): mostrar métricas reales del vendedor (ventas del mes,
 *   cotizaciones enviadas, clientes visitados, etc.) desde el backend.
 * TODO(Futuro): accesos directos que naveguen a cada pestaña.
 */
export default function HomeScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Hola, vendedor" subtitle="¿Qué necesitas hoy?" />

      <PlaceholderCard
        icon="🚜"
        title="Productos"
        description="Consulta el catálogo, precios y stock."
      />
      <PlaceholderCard
        icon="👥"
        title="Clientes"
        description="Busca clientes y sus datos de contacto."
      />
      <PlaceholderCard
        icon="📄"
        title="Cotizaciones"
        description="Próximamente: genera proformas en PDF."
      />
    </ScreenContainer>
  );
}
