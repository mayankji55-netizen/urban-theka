import { notFound } from "next/navigation";
import { OrderTracker } from "@/components/order-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TrackOrderPage({
params,
}: {
params: Promise<{ orderId: string }>;
}) {
const { orderId } = await params;

const supabase = await createSupabaseServerClient();

const { data: order } = await supabase
.from("orders")
.select("id, order_number, status, total, notes, order_items(quantity,item_name)")
.eq("id", orderId)
.single();

if (!order) notFound();

return ( <main className="min-h-screen bg-slate-100"> <div className="bg-black text-white"> <div className="mx-auto max-w-4xl px-6 py-8"> <div className="flex items-center gap-4"> <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold">
U </div>
        <div>
          <h1 className="text-3xl font-extrabold">URBAN THEKA</h1>
          <p className="font-medium text-orange-400">
            Love at First Bite ❤️
          </p>
          <p className="text-sm text-gray-300">
            Pizza • Burgers • Momos • Coffee
          </p>
        </div>
      </div>
    </div>
  </div>

  <div className="mx-auto max-w-4xl p-4">
    <Card className="rounded-3xl border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Order #{order.order_number}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <OrderTracker
          orderId={order.id}
          initialStatus={order.status}
        />

        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 text-lg font-bold">
            Items Ordered
          </h3>

          <div className="space-y-2">
            {order.order_items.map(
              (item: {
                quantity: number;
                item_name: string;
              }) => (
                <div
                  key={`${item.item_name}-${item.quantity}`}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <span>{item.item_name}</span>
                  <span className="font-semibold">
                    x {item.quantity}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
              {order.notes && (
  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
    <h3 className="mb-2 font-bold text-orange-600">
      Special Instructions
    </h3>

    <p className="text-gray-700">{order.notes}</p>
  </div>
)}

        <div className="rounded-2xl border bg-white p-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total Amount</span>
            <span>{currency(Number(order.total))}</span>
          </div>
        </div>

<div className="grid grid-cols-2 gap-3">
  <Button asChild className="h-12">
    <a href="tel:9451902326">
      <Phone className="mr-2 h-4 w-4" />
      Call Restaurant
    </a>
  </Button>

  <Button asChild variant="outline" className="h-12">
    <a
      href="https://wa.me/919451902326"
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      WhatsApp
    </a>
  </Button>
</div>
      </CardContent>
    </Card>
  </div>
</main>
);
}
