import { BUSINESS_INFO } from '@/content/business-info';

/**
 * Shape submitted by the install-package lead form. Used by both the
 * client form (typed via this interface) and the API route (validated
 * against this shape on the server before sending email).
 */
export interface InstallationLead {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  propertyType: 'House' | 'Townhouse' | 'Apartment' | 'Other';
  preferredTime: string;
  notes: string;
  /** Honeypot — must be empty for a real submission. */
  company: string;
}

export const PROPERTY_TYPES = [
  'House',
  'Townhouse',
  'Apartment',
  'Other',
] as const satisfies ReadonlyArray<InstallationLead['propertyType']>;

export const ELIGIBLE_POSTCODES: ReadonlySet<string> = new Set(
  BUSINESS_INFO.installPackagePostcodes,
);

export const PREFERRED_TIME_MAX = 200;
export const NOTES_MAX = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s-]{6,20}$/;

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof InstallationLead, string>>;
}

export function isEligiblePostcode(postcode: string): boolean {
  return ELIGIBLE_POSTCODES.has(postcode.trim());
}

export function isPropertyType(
  value: string,
): value is InstallationLead['propertyType'] {
  return (PROPERTY_TYPES as ReadonlyArray<string>).includes(value);
}

export function validateInstallationLead(
  raw: Partial<InstallationLead>,
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const fullName = (raw.fullName ?? '').trim();
  if (fullName.length < 2) errors.fullName = 'Please enter your full name.';

  const email = (raw.email ?? '').trim();
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email.';

  const phone = (raw.phone ?? '').trim();
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a valid phone number.';

  const address = (raw.address ?? '').trim();
  if (address.length < 5) errors.address = 'Please enter your property address.';

  const postcode = (raw.postcode ?? '').trim();
  if (!/^\d{4}$/.test(postcode)) {
    errors.postcode = 'Postcode must be a 4-digit number.';
  } else if (!isEligiblePostcode(postcode)) {
    errors.postcode =
      'Sorry — this package is currently NSW Central Coast only.';
  }

  const propertyType = (raw.propertyType ?? '').toString();
  if (!isPropertyType(propertyType)) {
    errors.propertyType = 'Please select a property type.';
  }

  const preferredTime = (raw.preferredTime ?? '').toString();
  if (preferredTime.length > PREFERRED_TIME_MAX) {
    errors.preferredTime = `Keep this under ${PREFERRED_TIME_MAX} characters.`;
  }

  const notes = (raw.notes ?? '').toString();
  if (notes.length > NOTES_MAX) {
    errors.notes = `Keep this under ${NOTES_MAX} characters.`;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
