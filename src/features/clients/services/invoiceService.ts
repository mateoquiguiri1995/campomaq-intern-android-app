import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet } from '@/api/client';

const INVOICE_CACHE_KEY_PREFIX = 'campomaq:cache:invoice:v1';
const INVOICE_LRU_KEYS_KEY = 'campomaq:cache:invoice_lru_keys:v1';
const MAX_CACHED_INVOICES = 20;

export interface InvoiceLine {
  code?: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  creditNoteValue?: number;
}

export interface InvoiceDetail {
  number: string;
  issuedAt?: string;
  clientName?: string;
  clientId?: string;
  address?: string;
  paymentType?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  items: InvoiceLine[];
}

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as ApiRecord
    : {};
}

function valueOf(source: ApiRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function stringOf(source: ApiRecord, keys: string[]): string | undefined {
  const value = valueOf(source, keys);
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function numberOf(source: ApiRecord, keys: string[]): number | undefined {
  const value = valueOf(source, keys);
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeLine(value: unknown): InvoiceLine {
  const line = asRecord(value);
  const quantity = numberOf(line, ['quantity', 'qty', 'cantidad']);
  const saleWithIva = numberOf(line, ['saleWithIva', 'sale_with_iva']);
  const creditNoteValue = numberOf(line, ['creditNoteValue', 'credit_note_value']);
  const unitPrice = numberOf(line, ['unitPrice', 'unit_price', 'price', 'precio'])
    ?? (saleWithIva !== undefined && quantity ? saleWithIva / quantity : undefined);

  return {
    code: stringOf(line, ['productCode', 'product_code', 'code', 'itemCode', 'item_code']),
    description: stringOf(line, ['description', 'productName', 'product_name', 'name', 'itemName']) ?? 'Producto',
    quantity,
    unitPrice,
    total: numberOf(line, ['total', 'lineTotal', 'line_total', 'subtotal'])
      ?? (saleWithIva !== undefined ? saleWithIva - (creditNoteValue ?? 0) : undefined),
    creditNoteValue,
  };
}

export async function getCachedInvoiceDetail(invoiceNumber: string): Promise<InvoiceDetail | null> {
  try {
    const raw = await AsyncStorage.getItem(`${INVOICE_CACHE_KEY_PREFIX}:${invoiceNumber}`);
    if (!raw) return null;

    const rawKeys = await AsyncStorage.getItem(INVOICE_LRU_KEYS_KEY);
    const keys: string[] = rawKeys ? JSON.parse(rawKeys) : [];
    await AsyncStorage.setItem(
      INVOICE_LRU_KEYS_KEY,
      JSON.stringify([invoiceNumber, ...keys.filter((key) => key !== invoiceNumber)])
    );
    return JSON.parse(raw) as InvoiceDetail;
  } catch {
    return null;
  }
}

export async function saveCachedInvoiceDetail(detail: InvoiceDetail): Promise<void> {
  try {
    const key = `${INVOICE_CACHE_KEY_PREFIX}:${detail.number}`;
    await AsyncStorage.setItem(key, JSON.stringify(detail));

    const rawKeys = await AsyncStorage.getItem(INVOICE_LRU_KEYS_KEY);
    const keys: string[] = rawKeys ? JSON.parse(rawKeys) : [];
    const updated = [detail.number, ...keys.filter((k) => k !== detail.number)];

    if (updated.length > MAX_CACHED_INVOICES) {
      const removed = updated.splice(MAX_CACHED_INVOICES);
      for (const oldNum of removed) {
        await AsyncStorage.removeItem(`${INVOICE_CACHE_KEY_PREFIX}:${oldNum}`);
      }
    }
    await AsyncStorage.setItem(INVOICE_LRU_KEYS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[Cache] Error guardando factura en caché:', error);
  }
}

/** Consulta y normaliza el detalle de una factura del backend con fallback a caché local. */
export async function getInvoiceDetail(invoiceNumber: string): Promise<InvoiceDetail> {
  try {
    const response = await apiGet<unknown>(`/invoices/${encodeURIComponent(invoiceNumber)}`);
    const raw = asRecord(response);
    const invoice = asRecord(valueOf(raw, ['invoice', 'data']));
    const source = Object.keys(invoice).length > 0 ? invoice : raw;
    const rawItems = valueOf(source, ['items', 'details', 'lines', 'products', 'invoiceItems']);
    const items = Array.isArray(rawItems) ? rawItems.map(normalizeLine) : [];
    const total = numberOf(source, ['total', 'totalAmount', 'total_amount'])
      ?? items.reduce((sum, item) => sum + (item.total ?? (item.quantity ?? 0) * (item.unitPrice ?? 0)), 0);

    const detail: InvoiceDetail = {
      number: stringOf(source, ['invoiceNumber', 'invoice_number', 'number', 'id']) ?? invoiceNumber,
      issuedAt: stringOf(source, ['invoiceDate', 'invoice_date', 'date', 'issuedAt', 'issued_at']),
      clientName: stringOf(source, ['clientName', 'client_name', 'customerName', 'customer_name']),
      clientId: stringOf(source, ['clientId', 'client_id', 'customerId', 'customer_id', 'ruc']),
      address: stringOf(source, ['address', 'clientAddress', 'client_address']),
      paymentType: stringOf(source, ['paymentType', 'payment_type', 'paymentMethod', 'payment_method']),
      subtotal: numberOf(source, ['subtotal', 'subTotal']),
      tax: numberOf(source, ['tax', 'iva', 'vat']),
      total,
      items,
    };

    saveCachedInvoiceDetail(detail);
    return detail;
  } catch (err) {
    const cached = await getCachedInvoiceDetail(invoiceNumber);
    if (cached) return cached;
    throw err;
  }
}
