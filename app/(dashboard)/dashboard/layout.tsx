import { DashboardShell } from "@/components/dashboard-shell";
import NewOrderPopup from "@/components/new-order-popup";
import { getActiveRestaurant } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const active = await getActiveRestaurant();
  if (!active) {
    return null;
  }
  
  return (
    <DashboardShell>
      <NewOrderPopup restaurantId={active.restaurant.id} />
      {children}
    </DashboardShell>
  );
}
