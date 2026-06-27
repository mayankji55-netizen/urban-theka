"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { restaurantSchema } from "@/lib/validators/auth";

export async function createRestaurantAction(formData: FormData) {
  const parsed = restaurantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid restaurant");

  const { supabase, user } = await requireUser();
  const { data: restaurant, error } = await supabase.from("restaurants").insert(parsed.data).select("*").single();
  if (error || !restaurant) throw new Error(error?.message ?? "Unable to create restaurant");

  const { error: memberError } = await supabase.from("restaurant_members").insert({
    restaurant_id: restaurant.id,
    user_id: user.id,
    role: "OWNER"
  });
  if (memberError) throw new Error(memberError.message);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateRestaurantAction(formData: FormData) {
  const id = String(formData.get("id"));
  const parsed = restaurantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid restaurant");

  const { supabase } = await requireUser();
  const { error } = await supabase.from("restaurants").update(parsed.data).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/settings");
}
