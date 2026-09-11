import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cart.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);
export default router;
