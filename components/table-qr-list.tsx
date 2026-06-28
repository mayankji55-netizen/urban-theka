"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Table = {
  id: string;
  table_number: number;
  qr_token: string;
  qr_code_url: string | null;
};

export function TableQrList({ tables }: { tables: Table[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => (
        <div
          key={table.id}
          className="rounded-xl border bg-background p-5 shadow-sm"
        >
          <p className="mb-3 text-lg font-bold">
            Table {table.table_number}
          </p>

          {table.qr_code_url ? (
            <img
              src={table.qr_code_url}
              alt={`QR for table ${table.table_number}`}
              className="mx-auto h-52 w-52 rounded-lg border object-contain"
            />
          ) : (
            <div className="flex h-52 items-center justify-center rounded-lg border bg-gray-100 text-gray-500">
              QR Not Generated
            </div>
          )}

          <Button asChild variant="outline" className="mt-4 w-full">
            <a
              href={table.qr_code_url ?? "#"}
              download={`table-${table.table_number}.png`}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}