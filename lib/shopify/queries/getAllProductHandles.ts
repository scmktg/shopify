import {
  shopifyClient,
  type ShopifyClientResponse,
} from '../client';

export interface ProductHandleEntry {
  handle: string;
  updatedAt: string;
}

const QUERY = /* GraphQL */ `
  query GetAllProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface RawResponse {
  products: {
    edges: ReadonlyArray<{ node: ProductHandleEntry }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

const PAGE_SIZE = 250;

export async function getAllProductHandles(): Promise<
  ReadonlyArray<ProductHandleEntry>
> {
  const all: ProductHandleEntry[] = [];
  let after: string | null = null;

  while (true) {
    const result: ShopifyClientResponse<RawResponse> =
      await shopifyClient.request<RawResponse>(QUERY, {
        variables: { first: PAGE_SIZE, after },
      });
    const { data, errors } = result;

    if (errors) {
      console.error(
        '[shopify] getAllProductHandles GraphQL errors:',
        JSON.stringify(errors, null, 2),
      );
      throw new Error('Failed to fetch product handles', { cause: errors });
    }

    if (!data?.products) break;

    for (const edge of data.products.edges) {
      all.push(edge.node);
    }

    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
    if (!after) break;
  }

  return all;
}
