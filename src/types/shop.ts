export type ProductCategory =
  | 'Potrawy'
  | 'Słodycze i owoce'
  | 'Tradycje'
  | 'Wyposażenie'
  | 'Atrakcje';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  pricePln: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  stock: number;
  variants: string[];
  specs: ProductSpec[];
}

export interface CartItem {
  product: Product;
  variant: string;
  quantity: number;
}

export type DeliveryMethodId = 'paczkomat' | 'kurier' | 'atelier';

export interface DeliveryMethod {
  id: DeliveryMethodId;
  label: string;
  description: string;
  pricePln: number;
}

export interface SimulationOrderItem {
  productId: string;
  sku: string;
  name: string;
  variant: string;
  unitPricePln: number;
  quantity: number;
  lineTotalPln: number;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface SimulationOrder {
  orderNumber: string;
  createdAt: string;
  userId?: string;
  customerName: string;
  deliveryMethod: DeliveryMethod;
  items: SimulationOrderItem[];
  subtotalPln: number;
  deliveryPln: number;
  totalPln: number;
}
