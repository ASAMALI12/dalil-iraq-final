import { getApiUrl, safeApiFetch } from '../utils/apiClient';

export interface AdPaymentRequestPayload {
  storeId: string;
  storeName: string;
  planScope: string;
  governorateId?: string;
  districtId?: string;
  categoryId?: string;
  headline: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  whatsapp?: string;
  offerBadge?: string;
  durationDays: number;
  amount: number;
  paymentMethod: 'zaincash' | 'mastercard';
  transferReference: string;
  receiptData: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  mediaType?: 'image' | 'slideshow';
  mediaItems?: string[];
  design?: Record<string, unknown>;
}

export async function createAdPaymentRequest(payload: AdPaymentRequestPayload) {
  return safeApiFetch('/api/ad-payment-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 20000);
}

export async function fetchAdPaymentSettings() {
  const res = await safeApiFetch('/api/ad-payment-settings', {}, 10000);
  return res.data || null;
}

export function apiReceiptUrl(id: string) {
  return getApiUrl(`/api/ad-payment-requests/${encodeURIComponent(id)}/receipt`);
}
