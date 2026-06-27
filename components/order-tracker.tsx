"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { OrderStatus } from "@/types/database";

const steps: OrderStatus[] = ["ACCEPTED", "PREPARING", "READY", "DELIVERED"];

export function OrderTracker({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`track:${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, (payload) => {
        setStatus((payload.new as { status: OrderStatus }).status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const active = steps.indexOf(status as (typeof steps)[number]);

  return (
    <div className="space-y-4">
      <Badge>{status}</Badge>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${index <= active ? "bg-primary" : "bg-muted"}`} />
            <p className={index <= active ? "font-semibold" : "text-muted-foreground"}>{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
