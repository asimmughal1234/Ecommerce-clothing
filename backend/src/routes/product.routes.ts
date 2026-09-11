import { Router } from "express";
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
} from "../controllers/product.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.get("/", listProducts);
router.get("/categories", listCategories);
router.post("/categories", requireAuth, requireAdmin, createCategory);
router.get("/:slug", getProductBySlug);
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);
export default router;
