/**
 * Shared site config surface for product-page trust signals.
 *
 * `content/business-info.ts` remains the single source of truth — this
 * module is a thin, named re-export so PDP components can pull
 * everything they need from one import without reaching into the
 * business-info shape directly. If you're adding a new piece of
 * config, add it to `business-info.ts` first, then surface it here.
 */
import { BUSINESS_INFO } from '@/content/business-info';

export const ORDER_CUTOFF = BUSINESS_INFO.orderCutoffTime;
export const ORDER_CUTOFF_DISPLAY = BUSINESS_INFO.orderCutoff;
export const SHIPPING_FREE_THRESHOLD_AUD =
  BUSINESS_INFO.shippingFreeThresholdAud;
export const DEFAULT_LOW_STOCK_THRESHOLD =
  BUSINESS_INFO.defaultLowStockThreshold;
export const PHONE_SUPPORT_HOURS = BUSINESS_INFO.phoneSupportHours;
export const PHONE_DISPLAY = BUSINESS_INFO.phone.display;
export const PHONE_TEL = BUSINESS_INFO.phone.tel;
export const SHOWROOM_LOCALITY = BUSINESS_INFO.showroom.locality;

export const BACK_IN_STOCK_ENDPOINT = '/api/back-in-stock';
