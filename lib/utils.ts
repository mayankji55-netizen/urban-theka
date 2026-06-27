import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function customerMenuUrl(slug: string, tableNumber: number) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://urban-theka-od44kpqiu-ut-team.vercel.app";

  return `${baseUrl}/r/${slug}/table/${tableNumber}`;
}
