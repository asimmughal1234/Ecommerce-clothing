"use client";

import { useEffect } from "react";
import { useAuth, useCart } from "@/lib/store";
import CartDrawer from "./CartDrawer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuth((s) => s.fetchMe);
  const fetchCart = useCart((s) => s.fetchCart);

  useEffect(() => {
    fetchMe();
    fetchCart();
  }, [fetchMe, fetchCart]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
