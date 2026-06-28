"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Bell, Clock, User, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/actions/orders";
import { toast } from "sonner";

type OrderItem = {
  quantity: number;
  item_name: string;
};

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
  tables?: {
    table_number: number;
  } | null;
};

export default function NewOrderPopup({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const supabase = createSupabaseBrowserClient();

  const bell = useRef<HTMLAudioElement | null>(null);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [minutes, setMinutes] = useState(15);
  const [countdown, setCountdown] = useState(0);

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    bell.current = new Audio("/sounds/order-bell.mp3");
    bell.current.loop = true;

    const channel = supabase
      .channel(`popup-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("orders")
            .select(
              `
              *,
              tables(table_number),
              order_items(quantity,item_name)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!data) return;

          setOrder(data);

          setOpen(true);

          bell.current?.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      bell.current?.pause();

      if (bell.current) bell.current.currentTime = 0;

      supabase.removeChannel(channel);
    };
  }, [restaurantId]);
  useEffect(() => {
  if (!open) return;

  setCountdown(minutes * 60);

  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [open, minutes]);

  if (!open || !order) return null;
    return (
    <div className="fixed right-5 top-5 z-[9999] w-[420px] animate-in slide-in-from-right duration-300">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between bg-red-600 px-4 py-3 text-white">

          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 animate-pulse" />

            <div>
              <p className="font-bold">
                New Order #{order.order_number}
              </p>

              <p className="text-xs opacity-90">
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              bell.current?.pause();
              if (bell.current) bell.current.currentTime = 0;
              setOpen(false);
            }}
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        <div className="space-y-4 p-4">

          <div className="rounded-xl bg-slate-100 p-3">

            <p className="font-semibold">
              Table :
              {" "}
              {order.tables?.table_number ?? "Manual"}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <User className="h-4 w-4" />

              <span>{order.customer_name}</span>
            </div>

            {order.customer_phone && (

              <div className="mt-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />

                <span>{order.customer_phone}</span>
              </div>

            )}

          </div>

          <div>

            <p className="mb-2 font-semibold">
              Order Items
            </p>

            <div className="space-y-2">

              {order.order_items.map((item, index) => (

                <div
                  key={index}
                  className="flex justify-between rounded-lg border p-2"
                >
                  <span>{item.item_name}</span>

                  <span>x {item.quantity}</span>
                </div>

              ))}

            </div>

          </div>

          <div className="flex justify-between rounded-xl bg-green-50 p-3 text-lg font-bold">

            <span>Total</span>

            <span>₹{order.total}</span>

          </div>

          <div>

            <label className="mb-2 flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4" />

              Preparation Time
            </label>

            <select
              value={minutes}
              onChange={(e) =>
                setMinutes(Number(e.target.value))
              }
              className="w-full rounded-lg border p-2"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={25}>25 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>

          </div>
                  <div className="flex gap-3">
          <Button
            variant="destructive"
            className="flex-1"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await updateOrderStatusAction({
  order_id: order.id,
  restaurant_id: restaurantId,
  status: "CANCELLED",
  estimated_minutes: 0,
});

if (result?.error) {
  toast.error(result.error);
  setLoading(false);
  return;
}
              bell.current?.pause();
              if (bell.current) bell.current.currentTime = 0;

              setOpen(false);
              setLoading(false);
            }}
          >
            Reject
          </Button>

          <Button
            className="flex-1"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const result = await updateOrderStatusAction({
  order_id: order.id,
  restaurant_id: restaurantId,
  status: "ACCEPTED",
  estimated_minutes: minutes,
});

if (result?.error) {
  toast.error(result.error);
  setLoading(false);
  return;
}

toast.success("✅ Order Accepted");
                bell.current?.pause();
                if (bell.current) bell.current.currentTime = 0;

                setOpen(false);
                setLoading(false);
            }}
          >
            Accept ({minutes} min)
          </Button>
        </div>

      </div>
    </div>
  </div>
);
}