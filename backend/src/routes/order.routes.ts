import { Router } from "express";
import { checkout, myOrders, getOrder } from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.post("/checkout", checkout);
router.get("/", myOrders);
router.get("/:id", getOrder);
export default router;
