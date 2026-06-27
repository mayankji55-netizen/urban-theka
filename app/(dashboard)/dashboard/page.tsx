import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveRestaurant } from "@/lib/auth";
import { currency } from "@/lib/utils";

export default async function DashboardPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [{ data: orders }, { count: activeTables }, { data: topItems }] = await Promise.all([
    active.supabase.from("orders").select("total,status").eq("restaurant_id", active.restaurant.id).gte("created_at", start.toISOString()),
    active.supabase.from("tables").select("*", { count: "exact", head: true }).eq("restaurant_id", active.restaurant.id),
    active.supabase
      .from("order_items")
      .select("item_name, quantity, orders!inner(restaurant_id)")
      .eq("orders.restaurant_id", active.restaurant.id)
      .limit(50)
  ]);

  const revenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;
  const top = Object.entries(
    topItems?.reduce<Record<string, number>>((acc, item) => {
      acc[item.item_name] = (acc[item.item_name] ?? 0) + item.quantity;
      return acc;
    }, {}) ?? {}
  ).sort((a, b) => b[1] - a[1])[0];

  const cards = [
    ["Orders today", orders?.length ?? 0],
    ["Revenue today", currency(revenue)],
    ["Active tables", activeTables ?? 0],
    ["Top selling item", top?.[0] ?? "No sales yet"]
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Live restaurant command center</p>
        <h1 className="text-3xl font-bold">{active.restaurant.name}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
