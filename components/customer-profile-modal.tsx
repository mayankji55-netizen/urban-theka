"use client";

import { useEffect, useState } from "react";
import { User, Phone, X, Save } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CustomerProfileModal({
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) return;

    const saved = localStorage.getItem("customer");

    if (saved) {
      const customer = JSON.parse(saved);
      setName(customer.name || "");
      setPhone(customer.phone || "");
    }
  }, [open]);

  if (!open) return null;

  function saveProfile() {
    if (!name.trim()) {
      alert("Enter your name");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Enter valid mobile number");
      return;
    }

    localStorage.setItem(
      "customer",
      JSON.stringify({
        name,
        phone,
      })
    );

    alert("Profile Updated");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <h2 className="text-2xl font-bold">
            My Profile
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

            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <div className="relative">

              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-xl border pl-11 pr-4"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Mobile Number
            </label>

            <div className="relative">

              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="h-12 w-full rounded-xl border pl-11 pr-4"
              />

            </div>

          </div>

          <button
            onClick={saveProfile}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] font-bold text-white hover:bg-orange-600"
          >
            <Save size={18} />
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}