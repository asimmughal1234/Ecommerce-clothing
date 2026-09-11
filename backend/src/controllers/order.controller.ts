import { Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { generateOrderNumber } from "../utils/orderNumber";

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

const checkoutSchema = z.object({
  paymentMethod: z.enum(["CARD", "COD"]),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(2),
    country: z.string().min(2),
    phone: z.string().min(5),
  }),
  saveAddress: z.boolean().optional(),
});

const SHIPPING_FLAT_RATE = 250;
const FREE_SHIPPING_THRESHOLD = 6000;
const TAX_RATE = 0.0;

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const data = checkoutSchema.parse(req.body);
  const userId = req.user!.userId;

  const cartItems = await prisma.cartItem.findMany({ where: { userId }, include: { product: true } });
  if (cartItems.length === 0) throw new ApiError(400, "Your cart is empty.");

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `${item.product.name} only has ${item.product.stock} left in stock.`);
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal,
        shippingFee,
        tax,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? "UNPAID" : "UNPAID",
        status: "PENDING",
        shippingName: data.shippingAddress.fullName,
        shippingLine1: data.shippingAddress.line1,
        shippingLine2: data.shippingAddress.line2,
        shippingCity: data.shippingAddress.city,
        shippingState: data.shippingAddress.state,
        shippingPostal: data.shippingAddress.postalCode,
        shippingCountry: data.shippingAddress.country,
        shippingPhone: data.shippingAddress.phone,
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            image: i.product.images[0] ?? "",
            price: i.product.price,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (data.saveAddress) {
      await tx.address.create({
        data: { userId, ...data.shippingAddress, isDefault: false },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return created;
  });

  if (data.paymentMethod === "COD") {
    return res.status(201).json({ order, checkoutUrl: null });
  }

  if (!stripe) {
    // Demo mode: no Stripe key configured. Mark PENDING so an admin/dev can simulate payment.
    return res.status(201).json({
      order,
      checkoutUrl: null,
      warning: "STRIPE_SECRET_KEY is not configured; card payment is running in demo mode.",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: env.currency,
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: { name: item.name, images: item.image ? [item.image] : [] },
      },
    })),
    success_url: `${env.clientUrl}/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${env.clientUrl}/checkout?cancelled=1`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  res.status(201).json({ order, checkoutUrl: session.url });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  if (!stripe || !env.stripeWebhookSecret) {
    return res.status(400).json({ error: "Stripe is not configured." });
  }
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed.` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PAID", status: "PROCESSING" },
      });
    }
  }

  res.json({ received: true });
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) throw new ApiError(404, "Order not found.");
  if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
    throw new ApiError(403, "You don't have access to this order.");
  }
  res.json({ order });
});
