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
  /** Clasificación comercial. Todavía no llega desde la API. */
  score?: ClientScore;
  /** Indica si el cliente tiene crédito pendiente. Todavía no llega desde la API. */
  hasPendingCredit?: boolean;
}

export type ClientScore = 'A+' | 'A' | 'B';

export type InvoiceStatus = 'paid' | 'pending';

export interface ClientInvoice {
  id: string;
  issuedAt: string;
  code: string;
  name: string;
  itemCount: number;
  paymentMethod: string;
  status: InvoiceStatus;
  total: number;
}

/** Información ampliada que se mostrará en la ficha del cliente. */
export interface ClientDetail extends Client {
  totalPurchases: number;
  purchaseCount: number;
  scoreLabel: string;
  notes: string[];
  invoices: ClientInvoice[];
}
