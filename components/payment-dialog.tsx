"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Props = {
  amount: number;
  onCod: () => Promise<void>;
  onSuccess: () => Promise<void>;
};

export default function PaymentDialog({
  amount,
  onCod,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  async function payOnline() {
    try {
      setLoading(true);

      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error("Unable to create payment.");
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,

        amount: data.order.amount,

        currency: "INR",

        name: "Urban Theka",

        description: "Food Order",

        order_id: data.order.id,

        handler: async function (response: any) {
  const verify = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });

  const result = await verify.json();

  if (!result.success) {
    toast.error("Payment Verification Failed");
    return;
  }

  toast.success("Payment Successful");

  await onSuccess();
},

        theme: {
          color: "#F59E0B",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (e) {
      console.error(e);

      toast.error("Payment failed.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
<div className="space-y-3">
  <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer">
    <input
      type="radio"
      checked={method === "COD"}
      onChange={() => setMethod("COD")}
    />
    <span className="font-semibold">Cash on Delivery</span>
  </label>

  <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer">
    <input
      type="radio"
      checked={method === "ONLINE"}
      onChange={() => setMethod("ONLINE")}
    />
    <span className="font-semibold">
      Pay Online (UPI / Card / Wallet)
    </span>
  </label>
</div>
        {method === "COD" ? (
        <Button
          disabled={loading}
          className="w-full h-12"
          onClick={onCod}
        >
          Confirm COD Order
        </Button>
      ) : (
        <Button
          disabled={loading}
          className="w-full h-12 bg-green-600 hover:bg-green-700"
          onClick={payOnline}
        >
          Pay ₹{amount}
        </Button>
      )}

    </div>
  );
}