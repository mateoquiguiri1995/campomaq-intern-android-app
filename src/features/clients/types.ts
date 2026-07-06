/** Tipos del módulo de clientes. */

export interface Client {
  id: string;
  /** Nombre de la empresa o del cliente. */
  name: string;
  contactPerson: string;
  /** RUC o cédula de identidad. */
  ruc: string;
  location?: string;
  /** Total histórico de compras en USD. Puede no venir del backend. */
  totalPurchases?: number;
  /** Puntaje interno del cliente (ej. 1-5). */
  score?: number;
}
