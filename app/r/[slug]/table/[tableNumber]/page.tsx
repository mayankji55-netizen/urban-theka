import { notFound } from "next/navigation";
import { CustomerMenuApp } from "@/components/customer-menu-app";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomerMenuPage({ params }: { params: Promise<{ slug: string; tableNumber: string }> }) {
  const { slug, tableNumber } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("slug", slug).single();
  if (!restaurant) notFound();

  const [{ data: table }, { data: categories }, { data: items }] = await Promise.all([
    supabase.from("tables").select("*").eq("restaurant_id", restaurant.id).eq("table_number", Number(tableNumber)).single(),
    supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurant.id).eq("available", true).order("popular", { ascending: false })
  ]);

  if (!table) notFound();
  return <CustomerMenuApp restaurant={restaurant} table={table} categories={categories ?? []} items={items ?? []} />;
}
