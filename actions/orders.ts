"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { checkoutSchema, statusSchema } from "@/lib/validators/order";

export async function createOrderAction(input: unknown) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid order" };

  const supabase = await createSupabaseServerClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("tax_rate, service_charge_rate, whatsapp_notifications_enabled, whatsapp")
    .eq("id", parsed.data.restaurant_id)
    .single();

  const itemIds = parsed.data.items.map((item) => item.menu_item_id);
  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price, available")
    .in("id", itemIds)
    .eq("restaurant_id", parsed.data.restaurant_id);

  if (menuError || !menuItems?.length) return { error: "Menu items are unavailable" };

  const items = parsed.data.items.map((cartItem) => {
    const menuItem = menuItems.find((item) => item.id === cartItem.menu_item_id && item.available);
    if (!menuItem) throw new Error("One item is not available");
    return {
      menu_item_id: menuItem.id,
      quantity: cartItem.quantity,
      price: Number(menuItem.price),
      item_name: menuItem.name
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (Number(restaurant?.tax_rate ?? 0) / 100);
  const service_charge = subtotal * (Number(restaurant?.service_charge_rate ?? 0) / 100);
  const total = subtotal + tax + service_charge;
let discount = 0;

if (parsed.data.coupon_code) {
  const { data: coupon } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", parsed.data.coupon_code)
    .eq("is_active", true)
    .single();

  if (coupon && subtotal >= coupon.min_order_value) {
    if (coupon.discount_type === "FLAT") {
      discount = Number(coupon.discount_value);
    }
  }
}

const finalTotal = total - discount;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: parsed.data.restaurant_id,
      table_id: parsed.data.table_id,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      notes: parsed.data.notes,
      subtotal,
      tax,
      service_charge,
      total: finalTotal,
      status: "ACCEPTED"
    })
    .select("*")
    .single();

  if (error || !order) return { error: error?.message ?? "Unable to place order" };

  const { error: itemsError } = await supabase.from("order_items").insert(items.map((item) => ({ ...item, order_id: order.id })));
  if (itemsError) return { error: itemsError.message };

  if (restaurant?.whatsapp_notifications_enabled && process.env.WHATSAPP_WEBHOOK_URL) {
    await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: order.id })
    }).catch(() => null);
  }

  const whatsappMessage = `
🍔 New Order

Customer: ${parsed.data.customer_name}
Phone: ${parsed.data.customer_phone}
Special Instructions: ${parsed.data.notes || "None"}

${items.map((i) => `${i.quantity}x ${i.item_name}`).join("\n")}

Total: ₹${total}
`;

const whatsappUrl = `https://wa.me/919451902326?text=${encodeURIComponent(
  whatsappMessage
)}`;

return {
  ok: true,
  orderId: order.id,
  whatsappUrl
};
}

export async function updateOrderStatusAction(input: unknown) {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid status" };
  }

  const { supabase } = await requireUser();

  // Current status fetch karo
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", parsed.data.order_id)
    .eq("restaurant_id", parsed.data.restaurant_id)
    .single();

  if (!order) {
    return { error: "Order not found" };
  }

  // Sirf next status allow karo
  const allowedTransitions: Record<string, string> = {
    ACCEPTED: "PREPARING",
    PREPARING: "READY",
    READY: "DELIVERED",
  };

  if (allowedTransitions[order.status] !== parsed.data.status) {
    return { error: "Invalid status transition" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.order_id)
    .eq("restaurant_id", parsed.data.restaurant_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/kitchen");

  return { ok: true };
}
