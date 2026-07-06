import type { Client } from '../types';

/**
 * Servicio de clientes.
 *
 * FASE ACTUAL: devuelve datos mock.
 *
 * TODO(Fase 3): reemplazar los mocks por llamadas reales al backend API
 *   usando apiClient (src/api/client.ts).
 * TODO(Fase 3): búsqueda real de clientes en el backend.
 * TODO(Fase 3): pantalla de detalle de cliente con historial de compras.
 */

const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Agrícola San Pedro S.A.',
    contactPerson: 'María Zambrano',
    ruc: '1791234567001',
    location: 'Machachi, Pichincha',
    totalPurchases: 18450,
    score: 5,
  },
  {
    id: 'c2',
    name: 'Hacienda El Rosal',
    contactPerson: 'Jorge Cárdenas',
    ruc: '0601234567001',
    location: 'Riobamba, Chimborazo',
    totalPurchases: 7320,
    score: 4,
  },
  {
    id: 'c3',
    name: 'Luis Andrango',
    contactPerson: 'Luis Andrango',
    ruc: '1712345678',
    location: 'Cayambe, Pichincha',
  },
];

/**
 * Devuelve la lista de clientes.
 * Es async para que la firma no cambie cuando se conecte al API real.
 */
export async function getClients(): Promise<Client[]> {
  // TODO(Fase 3): return apiGet<Client[]>('/clients');
  return MOCK_CLIENTS;
}
