import type { QuoteClient } from '../types';

export function getClientDisplayName(quoteClient: QuoteClient): string {
  return quoteClient.client.name;
}

/** Línea secundaria bajo el nombre: contacto/RUC/ubicación (registrado) o el contacto (manual). */
export function getClientDisplaySubtitle(quoteClient: QuoteClient): string | undefined {
  if (quoteClient.kind === 'registered') {
    const { email, phone, ruc, location } = quoteClient.client;
    const parts = [email ?? phone, ruc, location].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }
  return quoteClient.client.contact;
}
