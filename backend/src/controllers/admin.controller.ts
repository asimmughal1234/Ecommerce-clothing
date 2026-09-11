import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [productCount, orderCount, userCount, orders, lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { total: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      take: 5,
      orderBy: { stock: "asc" },
    }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const byDay = new Map<string, number>();
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
  }
  const revenueSeries = Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-14)
    .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));

  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  res.json({
    productCount,
    orderCount,
    userCount,
    revenue: Number(revenue.toFixed(2)),
    revenueSeries,
    lowStock,
    recentOrders,
  });
});

export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;

  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, total, page: Number(page) || 1, totalPages: Math.ceil(total / take) });
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = statusSchema.parse(req.body);
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: data.status,
      paymentStatus: data.status === "DELIVERED" || data.status === "PAID" ? "PAID" : undefined,
    },
  });
  res.json({ order });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});
