import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

function serializeCart(items: any[]) {
  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  return { items, subtotal: Number(subtotal.toFixed(2)), count: items.reduce((n, i) => n + i.quantity, 0) };
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(serializeCart(items));
});

const addSchema = z.object({
  productId: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const data = addSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw new ApiError(404, "Product not found.");
  if (product.stock < data.quantity) throw new ApiError(400, "Not enough stock available.");

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: req.user!.userId,
      productId: data.productId,
      size: data.size ?? null,
      color: data.color ?? null,
    },
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + data.quantity },
        include: { product: true },
      })
    : await prisma.cartItem.create({
        data: { userId: req.user!.userId, ...data },
        include: { product: true },
      });

  res.status(201).json({ item });
});

const updateSchema = z.object({ quantity: z.number().int().min(1) });

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const data = updateSchema.parse(req.body);
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.userId !== req.user!.userId) throw new ApiError(404, "Cart item not found.");

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: data.quantity },
    include: { product: true },
  });
  res.json({ item: updated });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.userId !== req.user!.userId) throw new ApiError(404, "Cart item not found.");
  await prisma.cartItem.delete({ where: { id: item.id } });
  res.status(204).send();
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  res.status(204).send();
});
