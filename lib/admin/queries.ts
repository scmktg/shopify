import { adminRequest } from './shopify-admin-client';

export interface DashboardMoney {
  amount: string;
  currencyCode: string;
}

export interface DashboardOrderSummary {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  customer: string | null;
  total: DashboardMoney;
}

export interface DashboardSalesPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface DashboardSalesSummary {
  windowDays: number;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  currencyCode: string;
  series: ReadonlyArray<DashboardSalesPoint>;
  previousWindowRevenue: number;
  previousWindowOrderCount: number;
}

export interface DashboardTopProduct {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
  currencyCode: string;
}

export interface DashboardInventoryAlert {
  variantId: string;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
}

interface OrdersPageResponse {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: ReadonlyArray<{
      cursor: string;
      node: OrderNode;
    }>;
  };
}

interface OrderNode {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  customer: { displayName: string | null } | null;
  currentTotalPriceSet: { shopMoney: DashboardMoney };
  subtotalLineItemsQuantity: number;
  lineItems: {
    edges: ReadonlyArray<{
      node: {
        quantity: number;
        originalTotalSet: { shopMoney: DashboardMoney };
        product: { id: string; title: string } | null;
      };
    }>;
  };
}

const ORDERS_QUERY = /* GraphQL */ `
  query AdminOrders($query: String!, $cursor: String) {
    orders(first: 250, after: $cursor, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        cursor
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          customer { displayName }
          currentTotalPriceSet { shopMoney { amount currencyCode } }
          subtotalLineItemsQuantity
          lineItems(first: 50) {
            edges {
              node {
                quantity
                originalTotalSet { shopMoney { amount currencyCode } }
                product { id title }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchOrdersInWindow(since: Date, until?: Date): Promise<ReadonlyArray<OrderNode>> {
  const sinceIso = since.toISOString();
  const filter = until
    ? `created_at:>=${sinceIso} AND created_at:<${until.toISOString()}`
    : `created_at:>=${sinceIso}`;

  const collected: OrderNode[] = [];
  let cursor: string | null = null;
  // Cap pagination to keep dashboard request bounded.
  for (let page = 0; page < 8; page += 1) {
    const data: OrdersPageResponse = await adminRequest<OrdersPageResponse>(
      ORDERS_QUERY,
      { query: filter, cursor },
    );
    for (const edge of data.orders.edges) {
      collected.push(edge.node);
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    cursor = data.orders.pageInfo.endCursor;
  }
  return collected;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function moneyAmount(money: DashboardMoney): number {
  const parsed = Number.parseFloat(money.amount);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getSalesSummary(windowDays = 30): Promise<DashboardSalesSummary> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 86_400_000);
  const previousStart = new Date(windowStart.getTime() - windowDays * 86_400_000);

  const [currentOrders, previousOrders] = await Promise.all([
    fetchOrdersInWindow(windowStart),
    fetchOrdersInWindow(previousStart, windowStart),
  ]);

  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (let i = 0; i < windowDays; i += 1) {
    const d = new Date(windowStart.getTime() + i * 86_400_000);
    buckets.set(d.toISOString().slice(0, 10), { orders: 0, revenue: 0 });
  }

  let totalRevenue = 0;
  let currencyCode = 'AUD';
  for (const order of currentOrders) {
    const key = dayKey(order.createdAt);
    const bucket = buckets.get(key);
    const value = moneyAmount(order.currentTotalPriceSet.shopMoney);
    totalRevenue += value;
    currencyCode = order.currentTotalPriceSet.shopMoney.currencyCode || currencyCode;
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += value;
    }
  }

  const series: DashboardSalesPoint[] = [];
  for (const [date, value] of buckets) {
    series.push({ date, orders: value.orders, revenue: value.revenue });
  }
  series.sort((a, b) => a.date.localeCompare(b.date));

  let previousRevenue = 0;
  for (const order of previousOrders) {
    previousRevenue += moneyAmount(order.currentTotalPriceSet.shopMoney);
  }

  const orderCount = currentOrders.length;

  return {
    windowDays,
    orderCount,
    totalRevenue,
    averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
    currencyCode,
    series,
    previousWindowRevenue: previousRevenue,
    previousWindowOrderCount: previousOrders.length,
  };
}

export async function getRecentOrders(limit = 10): Promise<ReadonlyArray<DashboardOrderSummary>> {
  const data = await adminRequest<OrdersPageResponse>(ORDERS_QUERY, {
    query: '',
    cursor: null,
  });
  return data.orders.edges.slice(0, limit).map(({ node }) => ({
    id: node.id,
    name: node.name,
    createdAt: node.createdAt,
    displayFinancialStatus: node.displayFinancialStatus,
    displayFulfillmentStatus: node.displayFulfillmentStatus,
    customer: node.customer?.displayName ?? null,
    total: node.currentTotalPriceSet.shopMoney,
  }));
}

export async function getTopProducts(
  windowDays = 30,
  limit = 5,
): Promise<ReadonlyArray<DashboardTopProduct>> {
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const orders = await fetchOrdersInWindow(since);

  const totals = new Map<
    string,
    { title: string; unitsSold: number; revenue: number; currencyCode: string }
  >();

  for (const order of orders) {
    for (const { node } of order.lineItems.edges) {
      const product = node.product;
      if (!product) continue;
      const existing = totals.get(product.id) ?? {
        title: product.title,
        unitsSold: 0,
        revenue: 0,
        currencyCode: node.originalTotalSet.shopMoney.currencyCode,
      };
      existing.unitsSold += node.quantity;
      existing.revenue += moneyAmount(node.originalTotalSet.shopMoney);
      totals.set(product.id, existing);
    }
  }

  return Array.from(totals.entries())
    .map(([productId, value]) => ({ productId, ...value }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

interface InventoryResponse {
  productVariants: {
    edges: ReadonlyArray<{
      node: {
        id: string;
        sku: string | null;
        title: string;
        inventoryQuantity: number | null;
        product: { title: string };
      };
    }>;
  };
}

const INVENTORY_QUERY = /* GraphQL */ `
  query LowInventory {
    productVariants(first: 100, query: "inventory_quantity:<=5", sortKey: INVENTORY_LEVELS_AVAILABLE) {
      edges {
        node {
          id
          sku
          title
          inventoryQuantity
          product { title }
        }
      }
    }
  }
`;

export async function getInventoryAlerts(
  threshold = 5,
  limit = 10,
): Promise<ReadonlyArray<DashboardInventoryAlert>> {
  const data = await adminRequest<InventoryResponse>(INVENTORY_QUERY);
  return data.productVariants.edges
    .map(({ node }) => ({
      variantId: node.id,
      productTitle: node.product.title,
      variantTitle: node.title === 'Default Title' ? null : node.title,
      sku: node.sku,
      quantity: node.inventoryQuantity ?? 0,
    }))
    .filter((entry) => entry.quantity <= threshold)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit);
}

interface ShopInfoResponse {
  shop: {
    name: string;
    primaryDomain: { url: string };
    currencyCode: string;
  };
}

const SHOP_QUERY = /* GraphQL */ `
  query AdminShop {
    shop {
      name
      primaryDomain { url }
      currencyCode
    }
  }
`;

export async function getShopInfo(): Promise<{
  name: string;
  primaryDomainUrl: string;
  currencyCode: string;
}> {
  const data = await adminRequest<ShopInfoResponse>(SHOP_QUERY);
  return {
    name: data.shop.name,
    primaryDomainUrl: data.shop.primaryDomain.url,
    currencyCode: data.shop.currencyCode,
  };
}
