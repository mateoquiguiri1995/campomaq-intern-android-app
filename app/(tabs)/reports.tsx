import { AppHeader } from '@/components/common/AppHeader';
import { PlaceholderCard } from '@/components/common/PlaceholderCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';

/**
 * Pestaña Reportes: solo placeholder.
 *
 * TODO(Fase 6): agregar reportes de ventas si el negocio los pide
 *   (ver src/features/reports/README.md).
 */
export default function ReportsScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Reportes" />
      <PlaceholderCard
        icon="📊"
        title="Disponible en una próxima versión."
        description="Aquí verás reportes de ventas y desempeño."
      />
    </ScreenContainer>
  );
}
