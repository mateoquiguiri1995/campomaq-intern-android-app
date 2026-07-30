import { useEffect, useState } from 'react';
import type { MonthlyGoal } from '../types';
import { getMonthlyGoal } from '../services/goalService';

export function useMonthlyGoal() {
  const [goal, setGoal] = useState<MonthlyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadGoal() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMonthlyGoal();
      setGoal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la meta del mes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoal();
  }, []);

  return {
    goal,
    loading,
    error,
    refresh: loadGoal,
  };
}
