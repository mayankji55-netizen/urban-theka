"use client";

import { useState } from "react";
import { User, Phone, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onLogin: (name: string, phone: string) => void;
};

export default function CustomerLoginModal({
  open,
  onClose,
  onLogin,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (!open) return null;

  function handleLogin() {
    if (name.trim().length < 2) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Enter a valid 10 digit mobile number.");
      return;
    }

    localStorage.setItem(
      "customer",
      JSON.stringify({
        name,
        phone,
      })
    );

    onLogin(name, phone);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <h2 className="text-2xl font-bold">
            Customer Login
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-5 p-6">

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 w-full rounded-xl border border-gray-300 pl-11 pr-4 outline-none focus:border-[#F59E0B]"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold">
              Mobile Number
            </label>

            <div className="relative">

              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                maxLength={10}
                inputMode="numeric"
                placeholder="9876543210"
                className="h-12 w-full rounded-xl border border-gray-300 pl-11 pr-4 outline-none focus:border-[#F59E0B]"
              />

            </div>

          </div>

          <button
            onClick={handleLogin}
            className="h-12 w-full rounded-xl bg-[#F59E0B] text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Continue
          </button>

          <p className="text-center text-xs text-gray-500">
            By continuing you agree to Urban Theka Terms & Privacy Policy.
          </p>

        </div>

      </div>

    </div>
  );
}