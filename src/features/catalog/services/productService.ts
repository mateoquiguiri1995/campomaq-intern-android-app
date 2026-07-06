import type { Product, ProductCategory } from '../types';

/**
 * Servicio de productos.
 *
 * FASE ACTUAL: devuelve datos mock.
 *
 * TODO(Fase 2): reemplazar los mocks por llamadas reales al backend API
 *   usando apiClient (src/api/client.ts). La app NUNCA consulta Postgres
 *   directamente.
 * TODO(Fase 2): búsqueda real por nombre y código en el backend.
 * TODO(Fase 2): filtrado real por categoría.
 * TODO(Fase 2): mostrar "stock actualizado hace X min" (el backend actualiza
 *   el stock cada 10 minutos).
 */

/** Categorías mostradas como chips en el catálogo. "Todos" no filtra. */
export const CATEGORIES: ('Todos' | ProductCategory)[] = [
  'Todos',
  'Cultivadores',
  'Motosierras',
  'Bombas',
  'Repuestos',
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: 'CM-1042',
    name: 'Motocultivador diésel 18 HP',
    category: 'Cultivadores',
    brand: 'Campo Maq',
    mainPrice: 2450,
    priceA: 2450,
    priceB: 2320,
    priceC: 2199,
    marginPct: 18,
    stockQty: 7,
  },
  {
    id: 'p2',
    code: 'CM-2088',
    name: 'Motosierra 22" cadena 3/8',
    category: 'Motosierras',
    brand: 'Stihl',
    mainPrice: 389.9,
    priceA: 389.9,
    priceB: 369.9,
    priceC: 349.9,
    marginPct: 22,
    stockQty: 3,
  },
  {
    id: 'p3',
    code: 'CM-3015',
    name: 'Bomba de agua 3" gasolina',
    category: 'Bombas',
    brand: 'Honda',
    mainPrice: 545,
    priceA: 545,
    priceB: 519,
    priceC: 495,
    stockQty: 0,
  },
];

/**
 * Devuelve la lista de productos.
 * Es async para que la firma no cambie cuando se conecte al API real.
 */
export async function getProducts(): Promise<Product[]> {
  // TODO(Fase 2): return apiGet<Product[]>('/products');
  return MOCK_PRODUCTS;
}
