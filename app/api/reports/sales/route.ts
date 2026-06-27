import { NextResponse } from "next/server";
import { getActiveRestaurant } from "@/lib/auth";

export async function GET(request: Request) {
  const active = await getActiveRestaurant();
  if (!active) return NextResponse.json({ error: "No restaurant" }, { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  const { data: orders } = await active.supabase
    .from("orders")
    .select("order_number,customer_name,customer_phone,status,subtotal,tax,service_charge,total,created_at")
    .eq("restaurant_id", active.restaurant.id)
    .order("created_at", { ascending: false });

  const rows = [
    ["Order", "Customer", "Phone", "Status", "Subtotal", "Tax", "Service charge", "Total", "Created at"],
    ...(orders ?? []).map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.status,
      order.subtotal,
      order.tax,
      order.service_charge,
      order.total,
      order.created_at
    ])
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const extension = format === "excel" ? "xls" : "csv";

  return new NextResponse(csv, {
    headers: {
      "content-type": format === "excel" ? "application/vnd.ms-excel" : "text/csv",
      "content-disposition": `attachment; filename="${active.restaurant.slug}-sales.${extension}"`
    }
  });
}
