import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getActiveRestaurant() {
  const { supabase, user } = await requireUser();
  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("role, restaurant_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership?.restaurant_id) return null;

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", membership.restaurant_id).single();
  if (!restaurant) return null;

  return {
    supabase,
    user,
    role: membership.role,
    restaurant: restaurant as Restaurant
  };
}
