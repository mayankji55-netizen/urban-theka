import { z } from "zod";
import type { OrderStatus } from "@/types/database";

export const orderStatuses = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;
export const checkoutSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  customer_name: z.string().min(2),
  customer_phone: z.string().min(8),
  notes: z.string().max(300).optional(),
coupon_code: z.string().optional(),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export const statusSchema = z.object({
  order_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  status: z.enum(orderStatuses),
  estimated_minutes: z.number().optional(),
});
