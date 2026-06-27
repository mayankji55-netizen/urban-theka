import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const restaurantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  phone: z.string().optional(),
  address: z.string().optional(),
  theme_color: z.string().default("#ef4444"),
  tax_rate: z.coerce.number().min(0).max(30).default(5),
  service_charge_rate: z.coerce.number().min(0).max(30).default(0)
});
