export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  story?: string | null;
  price: string;
  compareAtPrice?: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  material?: string | null;
  stock: number;
  sku: string;
  featured: boolean;
  isNewArrival: boolean;
  categoryId: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  _count?: { products: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface CartItem {
  id: string;
  productId: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  count: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: "CARD" | "COD";
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  tax: string;
  total: string;
  items: OrderItem[];
  createdAt: string;
  shippingName: string;
  shippingLine1: string;
  shippingCity: string;
  shippingCountry: string;
  user?: { name: string; email: string };
}
