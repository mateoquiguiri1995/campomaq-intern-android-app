/** Tipos del módulo de clientes. */

export interface Client {
  id: string;
  /** Nombre de la empresa o del cliente. */
  name: string;
  /** RUC o cédula de identidad (el backend usa el mismo valor que id). */
  ruc: string;
  email?: string;
  phone?: string;
  location?: string;
  /** Total histórico de compras en USD. Todavía no llega desde la API. */
  totalPurchases?: number;
  /** Puntaje interno del cliente (ej. 1-5). Todavía no llega desde la API. */
  score?: number;
}
