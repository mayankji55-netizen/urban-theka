import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  name: z.string().min(2),
  sort_order: z.coerce.number().int().default(0)
});

export const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  veg: z.coerce.boolean().default(true),
  available: z.coerce.boolean().default(true),
  popular: z.coerce.boolean().default(false)
});
