"use client";

import { create } from "zustand";
import { api } from "./api";
import { Cart, User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchMe: async () => {
    try {
      const data = await api.get<{ user: User }>("/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const data = await api.post<{ user: User }>("/auth/login", { email, password });
    set({ user: data.user });
  },
  register: async (name, email, password) => {
    const data = await api.post<{ user: User }>("/auth/register", { name, email, password });
    set({ user: data.user });
  },
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));

interface CartState {
  cart: Cart | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useCart = create<CartState>((set, get) => ({
  cart: null,
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  fetchCart: async () => {
    try {
      const cart = await api.get<Cart>("/cart");
      set({ cart });
    } catch {
      set({ cart: null });
    }
  },
  addItem: async (productId, quantity, size, color) => {
    await api.post("/cart/items", { productId, quantity, size, color });
    await get().fetchCart();
    set({ drawerOpen: true });
  },
  updateItem: async (itemId, quantity) => {
    await api.put(`/cart/items/${itemId}`, { quantity });
    await get().fetchCart();
  },
  removeItem: async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    await get().fetchCart();
  },
  clear: async () => {
    await api.delete("/cart");
    await get().fetchCart();
  },
}));
