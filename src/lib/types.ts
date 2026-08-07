/* Shared API types — mirror the backend response shapes. */

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  sku: string;
  price: number;
  images: string[];
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: Category | string;
  brand: Brand | string;
  seller: { id: string; name: string; email: string };
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  variantId: string;
  product: { id: string; name: string; slug: string };
  name: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export interface OrderItem {
  product: { id: string; name: string; images: string[] } | string;
  variantId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CheckoutResponse {
  order: Order;
  razorpayOrder: RazorpayOrder;
  keyId: string;
}

export const formatINR = (n: number) => "₹" + (n ?? 0).toLocaleString("en-IN");
