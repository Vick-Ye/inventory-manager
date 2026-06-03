import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
})

export const createItemSchema = z.object({
  name: z.string().min(1).max(255),
  notes: z.string().optional(),
  price: z.number().int().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  stock: z.number().int().min(0).optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
})

export const updateItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
  price: z.number().int().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
})

export const stockAdjustSchema = z.object({
  change: z.number().int().refine(v => v !== 0, 'change must be non-zero'),
  reason: z.string().min(1, 'Reason is required'),
})
