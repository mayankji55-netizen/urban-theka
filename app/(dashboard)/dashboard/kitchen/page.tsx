import { KitchenBoard } from "@/components/kitchen-board";
import { getActiveRestaurant } from "@/lib/auth";

export default async function KitchenPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;

  const { data: orders } = await active.supabase
    .from("orders")
    .select("*, tables(table_number), order_items(quantity,item_name)")
    .eq("restaurant_id", active.restaurant.id)
    .neq("status", "CANCELLED")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Realtime kitchen display</p>
        <h1 className="text-3xl font-bold">Kitchen Orders</h1>
      </div>
      <KitchenBoard initialOrders={(orders ?? []) as never} restaurantId={active.restaurant.id} />
    </div>
  );
}
