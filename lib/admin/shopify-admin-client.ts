/**
 * Shopify Admin API client. Used only by the internal admin
 * dashboard (`/admin/*`) — never imported by storefront code or
 * client components. Admin API exposes orders, customers, inventory
 * and analytics that the Storefront API does not.
 *
 * Requires SHOPIFY_ADMIN_TOKEN — a custom-app Admin API access
 * token with at minimum `read_orders`, `read_products`,
 * `read_inventory`, `read_customers`. Configured in Shopify Admin
 * under Settings → Apps and sales channels → Develop apps.
 */

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2026-04';

export class AdminApiConfigError extends Error {}
export class AdminApiRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function endpoint(): string {
  if (!storeDomain) {
    throw new AdminApiConfigError(
      'SHOPIFY_STORE_DOMAIN environment variable is required for the admin dashboard.',
    );
  }
  if (!adminToken) {
    throw new AdminApiConfigError(
      'SHOPIFY_ADMIN_TOKEN environment variable is required for the admin dashboard. Create a custom app in Shopify Admin and grant read_orders, read_products, read_inventory and read_customers.',
    );
  }
  return `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
}

interface AdminGraphQLResponse<TData> {
  data?: TData;
  errors?: ReadonlyArray<{ message: string }>;
}

export async function adminRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const url = endpoint();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken as string,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new AdminApiRequestError(
      `Shopify Admin API responded with ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const payload = (await response.json()) as AdminGraphQLResponse<TData>;

  if (payload.errors && payload.errors.length > 0) {
    const messages = payload.errors.map((e) => e.message).join('; ');
    throw new AdminApiRequestError(`Shopify Admin API error: ${messages}`, 200);
  }

  if (!payload.data) {
    throw new AdminApiRequestError('Shopify Admin API returned no data.', 200);
  }

  return payload.data;
}

export function isAdminConfigured(): boolean {
  return Boolean(storeDomain && adminToken);
}
