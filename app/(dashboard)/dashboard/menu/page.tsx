import { deleteMenuItemAction, upsertCategoryAction, upsertMenuItemAction } from "@/actions/menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveRestaurant } from "@/lib/auth";
import { currency } from "@/lib/utils";

export default async function MenuPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;
  const [{ data: categories }, { data: items }] = await Promise.all([
    active.supabase.from("categories").select("*").eq("restaurant_id", active.restaurant.id).order("sort_order"),
    active.supabase.from("menu_items").select("*, categories(name)").eq("restaurant_id", active.restaurant.id).order("created_at", { ascending: false })
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New category</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertCategoryAction} className="space-y-3">
              <input type="hidden" name="restaurant_id" value={active.restaurant.id} />
              <Input name="name" placeholder="Starters" required />
              <Input name="sort_order" type="number" defaultValue="0" />
              <Button className="w-full">Save category</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New menu item</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertMenuItemAction} className="space-y-3">
              <input type="hidden" name="restaurant_id" value={active.restaurant.id} />
              <Input name="name" placeholder="Paneer tikka" required />
              <Textarea name="description" placeholder="Description" />
              <Input name="price" type="number" step="0.01" placeholder="Price" required />
              <Input name="image_url" placeholder="Image URL or Supabase public URL" />
              <select name="category_id" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">No category</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm"><input name="veg" type="checkbox" defaultChecked /> Veg</label>
              <label className="flex items-center gap-2 text-sm"><input name="available" type="checkbox" defaultChecked /> Available</label>
              <label className="flex items-center gap-2 text-sm"><input name="popular" type="checkbox" /> Popular</label>
              <Button className="w-full">Save item</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        {(items ?? []).map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{item.name}</p>
                  <Badge className={item.veg ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}>
                    {item.veg ? "Veg" : "Non-veg"}
                  </Badge>
                  {item.popular ? <Badge>Popular</Badge> : null}
                  {!item.available ? <Badge className="border-muted-foreground text-muted-foreground">Hidden</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{item.categories?.name ?? "Uncategorized"} · {currency(Number(item.price))}</p>
              </div>
              <form action={deleteMenuItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button variant="destructive" size="sm">Delete</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
