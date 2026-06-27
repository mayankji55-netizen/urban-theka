import Link from "next/link";
import { redirect } from "next/navigation";
import { ChefHat, LayoutDashboard, LineChart, LogOut, Menu, Percent, Settings, Table2, Utensils } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { getActiveRestaurant } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, area: "analytics" },
  { href: "/dashboard/orders", label: "Orders", icon: Utensils, area: "orders" },
  { href: "/dashboard/kitchen", label: "Kitchen", icon: ChefHat, area: "orders" },
  { href: "/dashboard/menu", label: "Menu", icon: Menu, area: "menu" },
  { href: "/dashboard/tables", label: "Tables", icon: Table2, area: "tables" },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, area: "analytics" },
{ href: "/dashboard/discounts", label: "Discounts", icon: Percent, area: "settings" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, area: "settings" }
] as const;

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const active = await getActiveRestaurant();
  if (!active) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background p-4 lg:block">
        <div className="mb-8">
          <p className="text-xs uppercase text-muted-foreground">Restaurant OS</p>
          <h1 className="truncate text-xl font-bold">{active.restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">{active.role}</p>
        </div>
        <nav className="space-y-1">
          {nav
            .filter((item) => canAccess(active.role, item.area))
            .map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
        </nav>
        <form action={signOutAction} className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b bg-background p-4 lg:hidden">
          <h1 className="font-bold">{active.restaurant.name}</h1>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
