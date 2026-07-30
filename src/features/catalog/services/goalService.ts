import { apiGet } from '@/api/client';
import type { MonthlyGoal } from '../types';

/**
 * Servicio para obtener la meta mensual actual del vendedor/empresa.
 * Intenta consultar el endpoint /goals/current del backend.
 * Si falla o devuelve un objeto vacío, retorna null.
 */
export async function getMonthlyGoal(): Promise<MonthlyGoal | null> {
  try {
    const data = await apiGet<MonthlyGoal>('/goals/current');
    if (!data || !data.id) {
      return null;
    }
    return data;
  } catch (error) {
    console.warn('[goalService] No se pudo obtener la meta del mes desde el backend:', error);
    return null;
  }
}
