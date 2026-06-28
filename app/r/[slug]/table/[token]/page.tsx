import { notFound } from "next/navigation";
import { CustomerMenuApp } from "@/components/customer-menu-app";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
    token: string;
  }>;
};

export default async function CustomerMenuPage({
  params,
}: PageProps) {
  const { slug, token } = await params;

  const supabase = await createSupabaseServerClient();

  // Get Restaurant
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!restaurant) {
    notFound();
  }

  // Validate Table using UUID Token
  const [{ data: table }, { data: categories }, { data: items }] =
    await Promise.all([
      supabase
        .from("tables")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("qr_token", token)
        .single(),

      supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order"),

      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("available", true)
        .order("popular", { ascending: false }),
    ]);

  if (!table) {
    notFound();
  }

  return (
    <CustomerMenuApp
      restaurant={restaurant}
      table={table}
      categories={categories ?? []}
      items={items ?? []}
    />
  );
}