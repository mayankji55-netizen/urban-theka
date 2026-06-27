"use client";
import { validateCouponAction } from "@/actions/discounts";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { createOrderAction } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { HeroBanner } from "@/components/hero-banner";
const categoryImages: Record<string, string> = {
  Wraps: "/images/categories/wraps.png",
  Snacks: "/images/categories/snacks.png",
  Sandwiches: "/images/categories/sandwiches.png",
  "Pizza Mania": "/images/categories/pizza-mania.png",
  "Pizza @ 129": "/images/categories/pizza-129.png",
  Pizza: "/images/categories/pizza.png",
  Momos: "/images/categories/momos.png",
  "Maggi & Pasta": "/images/categories/maggi-pasta.png",
  "Lovers Heart Shape Pizza": "/images/categories/heart-pizza.png",
  Combos: "/images/categories/combos.png",
  "Choco Lava Cake": "/images/categories/lava-cake.png",
  Burgers: "/images/categories/burger.png",
  Beverages: "/images/categories/beverages.png",
};

type Restaurant = {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  theme_color: string;
  tax_rate: number;
  service_charge_rate: number;
};
type Category = { id: string; name: string };
type Item = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  veg: boolean;
  popular: boolean;
};

export function CustomerMenuApp({
  restaurant,
  table,
  categories,
  items
}: {
  restaurant: Restaurant;
  table: { id: string; table_number: number };
  categories: Category[];
  items: Item[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [pending, setPending] = useState(false);

  const { items: cart, addItem, updateQuantity, clear } = useCartStore();
  
  const cartCount = cart.reduce(
  (total, item) => total + item.quantity,
  0
);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = categoryId === "all" || item.category_id === categoryId;
        const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.description?.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [items, categoryId, query]
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (Number(restaurant.tax_rate) / 100);
  const service = subtotal * (Number(restaurant.service_charge_rate) / 100);
 const total = subtotal + tax + service - discountAmount;

  async function submit(formData: FormData) {
    const phone = String(formData.get("customer_phone") || "");

if (!/^\d{10}$/.test(phone)) {
  toast.error("Enter valid 10 digit mobile number");
  return;
}
  setPending(true);

  const result = await createOrderAction({
    restaurant_id: restaurant.id,
    table_id: table.id,
    customer_name: formData.get("customer_name"),
    customer_phone: formData.get("customer_phone"),
    notes: formData.get("notes"),
coupon_code: couponCode,
    items: cart.map((item) => ({
      menu_item_id: item.id,
      quantity: item.quantity
    }))
  });

  setPending(false);

  if (result?.error) {
    toast.error(result.error);
    return;
  }

  clear();

  if ((result as any)?.whatsappUrl) {
    window.open((result as any).whatsappUrl, "_blank");
  }

  if (result?.orderId) {
  console.log("Order ID:", result.orderId);
  router.push(`/track/${result.orderId}`);
} else {
  console.error("Order result:", result);
  toast.error("Order created but Order ID not found.");
}
}

  return (
    <main className="min-h-screen bg-muted/30 pb-28">
     <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl shadow-md">
        <div className="mx-auto max-w-4xl">
<HeroBanner
  restaurantName={restaurant.name}
  tableNumber={table.table_number}
  query={query}
  setQuery={setQuery}
  cartCount={cartCount}
  onCartClick={() => setCheckoutOpen(true)}
/>
          </div>
          {activeCoupon && (
  <div className="mt-4 rounded-xl bg-orange-500 p-3 text-center font-bold text-white">
    🔥 ₹{activeCoupon.discount_value} OFF | Use Code: {activeCoupon.code}
  </div>
)}

          <div className="hide-scrollbar mt-5 flex gap-5 overflow-x-auto pb-3">
            <Button size="sm" variant={categoryId === "all" ? "default" : "outline"} onClick={() => setCategoryId("all")}>All</Button>
            {categories.map((category) => (
              <Button
  key={category.id}
  variant="ghost"
  onClick={() => setCategoryId(category.id)}
  className="group h-auto min-w-[120px] flex-col rounded-3xl bg-transparent p-0 shadow-none hover:bg-transparent"
>
  <div
  className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px]
      ${
        categoryId === category.id
  ? "bg-[#FFF3E0] ring-2 ring-[#F59E0B] shadow-lg scale-105"
  : "bg-white border border-gray-200"
      }`}
  >
    <Image
  src={categoryImages[category.name] ?? "/images/categories/default.png"}
  alt={category.name}
  fill
  sizes="80px"
  className="rounded-[24px] object-cover"
/>
  </div>

  <span className="mt-2 max-w-[85px] text-center text-[13px] font-semibold leading-4 text-gray-800">
  {category.name}
</span>
</Button>
            ))}
          </div>
        
      </header>

      <section className="mx-auto grid max-w-4xl gap-4 p-4 sm:grid-cols-2">
        {filtered.map((item) => {
          const inCart = cart.find((cartItem) => cartItem.id === item.id);
          return (
            <article
  key={item.id}
  className="overflow-hidden rounded-3xl bg-white shadow-xl transition-all hover:-translate-y-1"
>
              {item.image_url ? <Image src={item.image_url} alt={item.name} width={640} height={360} className="h-56 w-full object-cover" /> : null}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{item.name}</h2>
                      <Badge className={item.veg ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"}>{item.veg ? "Veg" : "Non-veg"}</Badge>
                      {item.popular ? <Badge><Star className="h-3 w-3" /> Popular</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-2 font-bold">{currency(Number(item.price))}</p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-2 rounded-md border p-1">
                      <button className="px-2" onClick={() => updateQuantity(item.id, inCart.quantity - 1)}>-</button>
                      <span className="w-5 text-center text-sm font-bold">{inCart.quantity}</span>
                      <button className="px-2" onClick={() => updateQuantity(item.id, inCart.quantity + 1)}>+</button>
                    </div>
                  ) : (
                   <Button
  size="sm"
  className="rounded-xl bg-orange-500 px-5 font-bold text-white hover:bg-orange-600" onClick={() => addItem({ id: item.id, name: item.name, price: Number(item.price) })}>Add</Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {checkoutOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50">
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-lg bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Checkout</h2>
              <Button variant="ghost" onClick={() => setCheckoutOpen(false)}>Close</Button>
            </div>
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
              {discountAmount > 0 && (
  <div className="flex justify-between text-green-600">
    <span>Discount</span>
    <span>-{currency(discountAmount)}</span>
  </div>
)}
              <div className="flex justify-between"><span>Tax</span><span>{currency(tax)}</span></div>
              <div className="flex justify-between"><span>Service charge</span><span>{currency(service)}</span></div>
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>{currency(total)}</span></div>
            </div>
            <form action={submit} className="space-y-3">
              <Input name="customer_name" placeholder="Your name" required />
              <Input
  name="customer_phone"
  placeholder="Phone number"
  pattern="[0-9]{10}"
  maxLength={10}
  inputMode="numeric"
  required
/>
<Input
  placeholder="Coupon Code (Optional)"
  value={couponCode}
  onChange={(e) => {
  setCouponCode(e.target.value.toUpperCase());
  setCouponApplied(false);
  setDiscountAmount(0);
    setActiveCoupon(null);
}}
/>

<Button
  type="button"
    onClick={async () => {
  const code = couponCode.trim().toUpperCase();

  if (!code) {
    alert("Enter coupon code");
    return;
  }

  const coupon = await validateCouponAction(code);

  if (!coupon) {
    alert("Invalid Coupon");
    return;
  }
      setActiveCoupon(coupon);
setDiscountAmount(Number(coupon.discount_value || 0));
  setCouponApplied(true);
}}
>
  Apply Coupon
</Button>
              {couponApplied && (
  <p className="text-sm text-green-600">
    Coupon Applied Successfully
  </p>
)}
              <Textarea name="notes" placeholder="Less spicy, no onion, extra cheese..." />
              <Button className="h-12 w-full bg-green-600 font-bold text-white hover:bg-green-700" disabled={pending}>{pending ? "Placing order..." : "Place order"}</Button>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
