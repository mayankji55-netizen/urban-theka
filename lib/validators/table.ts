import { z } from "zod";

export const tableSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_number: z.coerce.number().int().positive()
});
