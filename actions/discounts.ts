"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createDiscountAction(formData: FormData) {
const supabase = await createSupabaseServerClient();

const code = String(formData.get("code") || "");
const discount_type = String(formData.get("discount_type") || "");
const discount_value = Number(formData.get("discount_value") || 0);
const min_order_value = Number(formData.get("min_order_value") || 0);

console.log("FORM DATA:", {
code,
discount_type,
discount_value,
min_order_value,
});

const { data, error } = await supabase
.from("discounts")
.insert({
restaurant_id: "c227e4f1-47a3-43db-9944-6a1948ac181c",
code,
discount_type,
discount_value,
min_order_value,
is_active: true,
})
.select();

console.log("INSERT RESULT:", data);

if (error) {
console.error("DISCOUNT ERROR:", error);
throw new Error(error.message);
}

return;
}

export async function validateCouponAction(code: string) {
const supabase = await createSupabaseServerClient();

const { data, error } = await supabase
.from("discounts")
.select("*")
.eq("code", code.toUpperCase())
.eq("is_active", true)
.single();

if (error) return null;

return data;
}
