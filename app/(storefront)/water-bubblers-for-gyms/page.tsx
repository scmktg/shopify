import { permanentRedirect } from 'next/navigation';

/**
 * The canonical gym / fitness bubbler guide now lives in the editorial
 * use-case cluster so there is one evidence-led source of truth for product
 * specifications, WaterMark identities and application guidance.
 */
export default function LegacyGymBubblersPage() {
  permanentRedirect('/use/commercial-and-cafe/gyms-and-fitness/');
}
