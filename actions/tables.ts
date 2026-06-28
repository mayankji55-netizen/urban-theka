"use server";

import QRCode from "qrcode";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { customerMenuUrl } from "@/lib/utils";
import { tableSchema } from "@/lib/validators/table";

export async function createTableAction(formData: FormData) {
  const parsed = tableSchema.safeParse(
    Object.fromEntries(formData)
  );

  const slug = String(formData.get("restaurant_slug"));

  if (!parsed.success) {
    throw new Error(
      parsed.error.errors[0]?.message ?? "Invalid table"
    );
  }

  const { supabase } = await requireUser();

  // UUID
  const qrToken = crypto.randomUUID();

  // Detect Current Host Automatically
  const headerList = await headers();

  const host = headerList.get("host")!;

  const protocol =
    process.env.NODE_ENV === "development"
      ? "http"
      : "https";

  const baseUrl = `${protocol}://${host}`;

  const menuUrl = customerMenuUrl(
    baseUrl,
    slug,
    qrToken
  );

  // Generate QR
  const qr_code_url = await QRCode.toDataURL(menuUrl, {
    width: 512,
    margin: 2,
  });

  // Save
  const { error } = await supabase
    .from("tables")
    .insert({
      ...parsed.data,
      qr_token: qrToken,
      qr_code_url,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/tables");
}

// ===================================================
// Regenerate All QR Codes
// ===================================================

export async function regenerateAllQrCodes() {
  const { supabase } = await requireUser();

  const { data: restaurant, error: restaurantError } =
    await supabase
      .from("restaurants")
      .select("id, slug")
      .single();

  if (restaurantError || !restaurant) {
    throw new Error("Restaurant not found");
  }

  const { data: tables, error: tableError } =
    await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurant.id);

  if (tableError) {
    throw new Error(tableError.message);
  }

  if (!tables?.length) return;

  // Detect Current Host Automatically
  const headerList = await headers();

  const host = headerList.get("host")!;

  const protocol =
    process.env.NODE_ENV === "development"
      ? "http"
      : "https";

  const baseUrl = `${protocol}://${host}`;

  for (const table of tables) {
    const qrToken = crypto.randomUUID();

    const menuUrl = customerMenuUrl(
      baseUrl,
      restaurant.slug,
      qrToken
    );

    const qr_code_url = await QRCode.toDataURL(
      menuUrl,
      {
        width: 512,
        margin: 2,
      }
    );

    const { error } = await supabase
      .from("tables")
      .update({
        qr_token: qrToken,
        qr_code_url,
      })
      .eq("id", table.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/dashboard/tables");
}