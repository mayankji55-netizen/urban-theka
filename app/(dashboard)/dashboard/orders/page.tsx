import { updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getActiveRestaurant } from "@/lib/auth";
import { currency } from "@/lib/utils";
import { orderStatuses } from "@/lib/validators/order";
import OrdersClient from "@/components/orders-client";
import CountdownTimer from "@/components/countdown-timer";

export default async function OrdersPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;
  const { data: orders } = await active.supabase
    .from("orders")
    .select("*, tables(table_number), order_items(quantity,item_name)")
    .eq("restaurant_id", active.restaurant.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <OrdersClient restaurantId={active.restaurant.id} />
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="space-y-4">
        {(orders ?? []).map((order) => (
          <Card key={order.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">Order #{order.order_number}</p>
                    <Badge>{order.status === "NEW" ? "ORDER" : order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Table {order.tables?.table_number ?? "Manual"} · {order.customer_name} · {currency(Number(order.total))}
                  </p>
                  {["ACCEPTED", "PREPARING", "READY"].includes(order.status) && (
  <CountdownTimer
    acceptedAt={order.accepted_at}
    estimatedMinutes={order.estimated_minutes}
  />
)}
                  <p className="mt-2 text-sm">
                    {order.order_items.map((item: { quantity: number; item_name: string }) => `${item.quantity}x ${item.item_name}`).join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map((status) => (
                    <form key={status} action={async () => {
                      "use server";
                      await updateOrderStatusAction({ order_id: order.id, restaurant_id: active.restaurant.id, status });
                    }}>
<Button
  size="sm"
  variant={order.status === status ? "default" : "outline"}
  disabled={
    (order.status === "ACCEPTED" && status !== "PREPARING") ||
    (order.status === "PREPARING" && status !== "READY") ||
    (order.status === "READY" && status !== "DELIVERED") ||
    order.status === "DELIVERED"
  }
>
  {status}
</Button>
                    </form>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
