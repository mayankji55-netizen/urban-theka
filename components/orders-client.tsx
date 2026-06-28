"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import CountdownTimer from "@/components/countdown-timer";
import { updateOrderStatusAction } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import { orderStatuses } from "@/lib/validators/order";

type OrdersClientProps = {
  restaurantId: string;
  orders: any[];
};

export default function OrdersClient({
  restaurantId,
  orders,
}: OrdersClientProps) {
  const router = useRouter();

  const bell = useRef<HTMLAudioElement | null>(null);

  const [liveOrders, setLiveOrders] = useState<any[]>(orders ?? []);

  useEffect(() => {
  setLiveOrders(Array.isArray(orders) ? orders : []);
}, [orders]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    bell.current = new Audio("/sounds/order-bell.mp3");
    bell.current.loop = true;

    const channel = supabase
      .channel(`orders-${restaurantId}`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          try {
            bell.current!.currentTime = 0;
            await bell.current!.play();
          } catch {}

          toast.success("🔔 New Order Received");

          router.refresh();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const updated = payload.new as any;

          setLiveOrders((prev) =>
            prev.map((o) =>
              o.id === updated.id
                ? {
                    ...o,
                    ...updated,
                  }
                : o
            )
          );

          if (
            updated.status === "ACCEPTED" ||
            updated.status === "PREPARING"
          ) {
            bell.current?.pause();

            if (bell.current) {
              bell.current.currentTime = 0;
            }
          }
        }
      )

      .subscribe();

    return () => {
      bell.current?.pause();

      if (bell.current) {
        bell.current.currentTime = 0;
      }

      supabase.removeChannel(channel);
    };
  }, [restaurantId, router]);
  console.log("Orders prop:", orders);
console.log("LiveOrders:", liveOrders);
    return (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Orders</h1>

    <div className="space-y-4">
      {(liveOrders ?? []).map((order) => (
        <Card key={order.id}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold">
                    Order #{order.order_number}
                  </p>

                  <Badge>
                    {order.status === "NEW"
                      ? "ORDER"
                      : order.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Table {order.tables?.table_number ?? "Manual"} ·{" "}
                  {order.customer_name} ·{" "}
                  {currency(Number(order.total))}
                </p>

                {[
                  "ACCEPTED",
                  "PREPARING",
                  "READY",
                ].includes(order.status) && (
                  <CountdownTimer
                    acceptedAt={order.accepted_at}
                    estimatedMinutes={
                      order.estimated_minutes
                    }
                  />
                )}

                <p className="mt-2 text-sm">
                  {order.order_items
                    ?.map(
                      (item: any) =>
                        `${item.quantity}x ${item.item_name}`
                    )
                    .join(", ")}
                </p>
              </div>
       <div className="flex flex-wrap gap-2">
  {orderStatuses.map((status) => (
    <Button
      key={status}
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