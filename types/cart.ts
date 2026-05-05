import type { Money, ProductImage, SelectedOption } from './product';

export interface CartLineMerchandise {
  id: string;
  title: string;
  sku: string | null;
  selectedOptions: ReadonlyArray<SelectedOption>;
  image: ProductImage | null;
  price: Money;
  product: {
    handle: string;
    title: string;
    tags: ReadonlyArray<string>;
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: CartLineMerchandise;
  totalAmount: Money;
}

export interface Cart {
  id: string;
  totalQuantity: number;
  subtotalAmount: Money;
  totalAmount: Money;
  checkoutUrl: string;
  lines: ReadonlyArray<CartLine>;
}
