"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { currency } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

type Order = {
  id: string;
  order_number: number;
  status: OrderStatus;
  total: number;
  customer_name: string;
  created_at: string;
  tables: { table_number: number } | null;
  order_items: { quantity: number; item_name: string }[];
};

const columns: OrderStatus[] = ["ACCEPTED", "PREPARING", "READY", "DELIVERED"];

export function KitchenBoard({ initialOrders, restaurantId }: { initialOrders: Order[]; restaurantId: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    audio.current = new AudioContext();
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`orders:${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        async (payload) => {
          const { data } = await supabase
            .from("orders")
            .select("*, tables(table_number), order_items(quantity,item_name)")
            .eq("id", (payload.new as { id: string }).id)
            .single();
          if (!data) return;
          setOrders((current) => [data as Order, ...current.filter((order) => order.id !== data.id)]);
          if ((payload.new as Order).status === "ACCEPTED") {
            playNewOrderTone(audio.current);
            toast.success("New order received");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const byColumn = useMemo(
    () =>
      columns.reduce<Record<OrderStatus, Order[]>>((acc, status) => {
        acc[status] = orders.filter((order) => order.status === status);
        return acc;
      }, {} as Record<OrderStatus, Order[]>),
    [orders]
  );

  async function onDragEnd(event: DragEndEvent) {
    const orderId = String(event.active.id);
    const status = event.over?.id as OrderStatus | undefined;
    if (!status || !columns.includes(status)) return;
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    const result = await updateOrderStatusAction({ order_id: orderId, restaurant_id: restaurantId, status });
    if (result?.error) toast.error(result.error);
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((status) => (
          <KitchenColumn key={status} status={status} count={byColumn[status]?.length ?? 0}>
              {byColumn[status]?.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </KitchenColumn>
        ))}
      </div>
    </DndContext>
  );
}

function KitchenColumn({ status, count, children }: { status: OrderStatus; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={`min-h-96 rounded-lg border bg-muted/40 p-3 ${isOver ? "ring-2 ring-primary" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">{status}</h2>
        <Badge>{count}</Badge>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: order.id });
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold">#{order.order_number}</p>
            <p className="text-sm text-muted-foreground">Table {order.tables?.table_number ?? "Manual"}</p>
          </div>
          <Badge>{currency(Number(order.total))}</Badge>
        </div>
        <p className="mt-2 text-sm font-medium">{order.customer_name}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {order.order_items.map((item, index) => (
            <li key={`${order.id}-${index}`}>
              {item.quantity}x {item.item_name}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function playNewOrderTone(context: AudioContext | null) {
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 880;
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
}
