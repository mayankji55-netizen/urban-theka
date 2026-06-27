import { createRestaurantAction } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Set up your restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRestaurantAction} className="grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Restaurant name" required />
            <Input name="slug" placeholder="public-menu-slug" required />
            <Input name="phone" placeholder="Phone" />
            <Input name="theme_color" type="color" defaultValue="#ef4444" />
            <Textarea name="address" placeholder="Address" className="md:col-span-2" />
            <Input name="tax_rate" type="number" step="0.01" defaultValue="5" placeholder="Tax %" />
            <Input name="service_charge_rate" type="number" step="0.01" defaultValue="0" placeholder="Service charge %" />
            <Button className="md:col-span-2">Launch dashboard</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
