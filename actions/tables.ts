"use server";

import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { customerMenuUrl } from "@/lib/utils";
import { tableSchema } from "@/lib/validators/table";

export async function createTableAction(formData: FormData) {
  const parsed = tableSchema.safeParse(Object.fromEntries(formData));
  const slug = String(formData.get("restaurant_slug"));
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid table");

  const { supabase } = await requireUser();
  const menuUrl = customerMenuUrl(slug, parsed.data.table_number);
  const qr_code_url = await QRCode.toDataURL(menuUrl, { width: 512, margin: 2 });

  const { error } = await supabase.from("tables").insert({ ...parsed.data, qr_code_url });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/tables");
}
