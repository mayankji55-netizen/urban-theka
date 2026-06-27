"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Table = { id: string; table_number: number; qr_code_url: string | null };

export function TableQrList({ tables }: { tables: Table[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => (
        <div key={table.id} className="rounded-lg border bg-background p-4">
          <p className="mb-3 font-semibold">Table {table.table_number}</p>
          {table.qr_code_url ? <img src={table.qr_code_url} alt={`QR for table ${table.table_number}`} className="mx-auto h-48 w-48" /> : null}
          {table.qr_code_url ? (
            <Button asChild variant="outline" className="mt-4 w-full">
              <a href={table.qr_code_url} download={`table-${table.table_number}-qr.png`}>
                <Download className="h-4 w-4" />
                Download PNG
              </a>
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
