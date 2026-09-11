import { Request, Response } from "express";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    size,
    color,
    sort = "newest",
    page = "1",
    limit = "12",
    featured,
  } = req.query as Record<string, string>;

  const where: any = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (size) where.sizes = { has: size };
  if (color) where.colors = { has: color };
  if (featured === "true") where.featured = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy: any =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "name"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const take = Math.min(Number(limit) || 12, 48);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take, skip, include: { category: true } }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page: Number(page) || 1, pageSize: take, totalPages: Math.ceil(total / take) });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product) throw new ApiError(404, "Product not found.");

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
  });

  res.json({ product, related });
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  story: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  images: z.array(z.string().url()).min(1),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  material: z.string().optional(),
  stock: z.number().int().min(0),
  sku: z.string().min(2),
  categoryId: z.string(),
  featured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = productSchema.parse(req.body);
  const slug = slugify(data.name, { lower: true, strict: true });

  const product = await prisma.product.create({
    data: { ...data, slug },
  });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const data = productSchema.partial().parse(req.body);
  const updateData: any = { ...data };
  if (data.name) updateData.slug = slugify(data.name, { lower: true, strict: true });

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
  });
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  res.json({ categories });
});

const categorySchema = z.object({
  name: z.string().min(2),
  imageUrl: z.string().url().optional(),
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const data = categorySchema.parse(req.body);
  const slug = slugify(data.name, { lower: true, strict: true });
  const category = await prisma.category.create({ data: { ...data, slug } });
  res.status(201).json({ category });
});
