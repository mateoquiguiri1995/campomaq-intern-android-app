import { apiGet } from '@/api/client';

import type { SellerDashboard } from '../types';

/** El backend filtra la respuesta usando el token Bearer de la sesión actual. */
export async function getAuthenticatedSellerDashboard(): Promise<SellerDashboard> {
  const sellers = await apiGet<SellerDashboard[]>('/sellers');
  const seller = sellers[0];
  if (!seller) throw new Error('No encontramos información comercial para este vendedor.');
  return seller;
}
