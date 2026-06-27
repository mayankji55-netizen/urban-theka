import { format } from "date-fns";
import { AnalyticsChart } from "@/components/analytics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveRestaurant } from "@/lib/auth";

export default async function AnalyticsPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: orders } = await active.supabase
    .from("orders")
    .select("total,created_at")
    .eq("restaurant_id", active.restaurant.id)
    .gte("created_at", since.toISOString());

  const data = Object.values(
    (orders ?? []).reduce<Record<string, { label: string; revenue: number; orders: number }>>((acc, order) => {
      const label = format(new Date(order.created_at), "dd MMM");
      acc[label] ??= { label, revenue: 0, orders: 0 };
      acc[label].revenue += Number(order.total);
      acc[label].orders += 1;
      return acc;
    }, {})
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <AnalyticsChart data={data} />
      <div className="grid gap-4 md:grid-cols-3">
        {["Daily sales", "Weekly sales", "Monthly sales"].map((label) => (
          <Card key={label}>
            <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Export-ready revenue and order trends from Supabase.</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
