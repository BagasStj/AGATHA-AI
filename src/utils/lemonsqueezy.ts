import { LEMONSQUEEZY_STORE_ID } from '../config/lemonsqueezy';

export function createCheckoutUrl(variantId: string, custom?: Record<string, string>) {
  const baseUrl = `https://ai-retail.lemonsqueezy.com/checkout/`;
  
  if (custom) {
    const params = new URLSearchParams(custom);
    return `${baseUrl}?${params.toString()}`;
  }
  
  return baseUrl;
}
