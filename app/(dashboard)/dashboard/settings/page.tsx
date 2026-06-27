import { updateRestaurantAction } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveRestaurant } from "@/lib/auth";

export default async function SettingsPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;
  const restaurant = active.restaurant;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateRestaurantAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={restaurant.id} />
          <Input name="name" defaultValue={restaurant.name} required />
          <Input name="slug" defaultValue={restaurant.slug} required />
          <Input name="phone" defaultValue={restaurant.phone ?? ""} placeholder="Phone" />
          <Input name="theme_color" type="color" defaultValue={restaurant.theme_color} />
          <Textarea name="address" defaultValue={restaurant.address ?? ""} className="md:col-span-2" />
          <Input name="tax_rate" type="number" step="0.01" defaultValue={restaurant.tax_rate} />
          <Input name="service_charge_rate" type="number" step="0.01" defaultValue={restaurant.service_charge_rate} />
          <Button className="md:col-span-2">Save settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}
