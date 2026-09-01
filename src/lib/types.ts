export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  emoji: string;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  method: "efectivo" | "tarjeta" | "credito";
  client_name: string | null;
  concept: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  product_emoji: string;
  price: number;
  qty: number;
}

export interface Credit {
  id: string;
  user_id: string;
  client: string;
  amount: number;
  paid: number;
  pending: number;
  status: "pendiente" | "pagado";
  concept: string | null;
  sale_id: string | null;
  date: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: "basico" | "estandar" | "premium";
  status: string;
  expires_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  plan: string;
  receipt_url: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  admin_note: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
}

export type PlanType = "basico" | "estandar" | "premium";

export const PLAN_LIMITS: Record<PlanType, { maxProducts: number; price: number; label: string }> = {
  basico: { maxProducts: -1, price: 500, label: "Básico" },
  estandar: { maxProducts: -1, price: 800, label: "Estándar" },
  premium: { maxProducts: -1, price: 1200, label: "Premium" },
};
