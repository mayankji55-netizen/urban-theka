import { createDiscountAction } from "@/actions/discounts";
import { getActiveRestaurant } from "@/lib/auth";

export default async function DiscountsPage() {
  const active = await getActiveRestaurant();

  const { data: coupons } = await active!.supabase
    .from("discounts")
    .select("*")
    .eq("restaurant_id", active!.restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Discounts</h1>

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-4">Create Coupon</h2>

        <form
          action={createDiscountAction}
          className="grid gap-3 max-w-md"
        >
          <input
            name="code"
            placeholder="Coupon Code"
            className="border rounded p-2"
          />

          <select
            name="discount_type"
            className="border rounded p-2"
          >
            <option value="PERCENT">PERCENT</option>
            <option value="FLAT">FLAT</option>
          </select>

          <input
            name="discount_value"
            placeholder="Discount Value"
            type="number"
            className="border rounded p-2"
          />

          <input
            name="min_order_value"
            placeholder="Minimum Order Value"
            type="number"
            className="border rounded p-2"
          />

          <button
            type="submit"
            className="bg-black text-white rounded p-2"
          >
            Create Coupon
          </button>
        </form>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-4">Coupons</h2>

        {(coupons ?? []).map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded p-3 mb-2"
          >
            <p><b>{coupon.code}</b></p>
            <p>
              {coupon.discount_type} - ₹{coupon.discount_value}
            </p>
            <p>
              Min Order ₹{coupon.min_order_value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}