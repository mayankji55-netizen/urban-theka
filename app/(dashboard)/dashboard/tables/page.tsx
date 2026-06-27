import { createTableAction } from "@/actions/tables";
import { TableQrList } from "@/components/table-qr-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getActiveRestaurant } from "@/lib/auth";

export default async function TablesPage() {
  const active = await getActiveRestaurant();
  if (!active) return null;
  const { data: tables } = await active.supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", active.restaurant.id)
    .order("table_number");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Generate and download QR codes</p>
        <h1 className="text-3xl font-bold">Tables</h1>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create table</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTableAction} className="flex gap-2">
            <input type="hidden" name="restaurant_id" value={active.restaurant.id} />
            <input type="hidden" name="restaurant_slug" value={active.restaurant.slug} />
            <Input name="table_number" type="number" min="1" placeholder="Table number" required />
            <Button>Create</Button>
          </form>
        </CardContent>
      </Card>
      <TableQrList tables={tables ?? []} />
    </div>
  );
}
