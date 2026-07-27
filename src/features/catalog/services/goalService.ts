import type { MonthlyGoal } from '../types';

/**
 * Mock data para la Meta del Mes.
 * En el futuro se conectará con el endpoint del backend API.
 */
export const MOCK_MONTHLY_GOAL: MonthlyGoal = {
  id: 'goal-julio-2026',
  title: 'Meta del mes',
  period: 'Julio 2026',
  achievedMargin: 34250,
  targetMargin: 50000,
  percentage: 68.5,
};

/**
 * Servicio para obtener la meta mensual actual del vendedor/empresa.
 */
export async function getMonthlyGoal(): Promise<MonthlyGoal> {
  // Simula llamada a API si fuese necesario
  return Promise.resolve(MOCK_MONTHLY_GOAL);
}
