"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { categorySchema, menuItemSchema } from "@/lib/validators/menu";

export async function upsertCategoryAction(formData: FormData) {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid category");

  const { supabase } = await requireUser();
  const { error } = await supabase.from("categories").upsert(parsed.data);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menu");
}

export async function upsertMenuItemAction(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = menuItemSchema.safeParse({
    ...raw,
    veg: raw.veg === "on" || raw.veg === "true",
    available: raw.available === "on" || raw.available === "true",
    popular: raw.popular === "on" || raw.popular === "true",
    image_url: raw.image_url || null,
    description: raw.description || null,
    category_id: raw.category_id || null
  });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid item");

  const { supabase } = await requireUser();
  const { error } = await supabase.from("menu_items").upsert(parsed.data);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menu");
}

export async function deleteMenuItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { supabase } = await requireUser();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/menu");
}
