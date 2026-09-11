import { Router } from "express";
import { dashboardStats, listAllOrders, updateOrderStatus, listUsers } from "../controllers/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/stats", dashboardStats);
router.get("/orders", listAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/users", listUsers);
export default router;
