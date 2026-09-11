import { Router } from "express";
import { stripeWebhook } from "../controllers/order.controller";

const router = Router();
// NOTE: this route is mounted with express.raw() body parsing in server.ts
// because Stripe requires the raw payload to verify the webhook signature.
router.post("/webhook", stripeWebhook);
export default router;
