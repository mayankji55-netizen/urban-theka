import type { AppRole } from "@/types/database";

export function canAccess(role: AppRole, area: "orders" | "menu" | "tables" | "settings" | "analytics") {
  const permissions: Record<AppRole, typeof area[]> = {
    OWNER: ["orders", "menu", "tables", "settings", "analytics"],
    MANAGER: ["orders", "menu", "analytics"],
    KITCHEN: ["orders"],
    WAITER: ["orders", "tables"]
  };

  return permissions[role].includes(area);
}
