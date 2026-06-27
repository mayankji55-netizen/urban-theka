"use client";

import Image from "next/image";
import CustomerLoginModal from "./customer-login-modal";
import CustomerProfileModal from "./customer-profile-modal";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User } from "lucide-react";

const banners = [
  "/images/banner1.png",
  "/images/banner2.png",
  "/images/banner3.png",
  "/images/banner4.png",
  "/images/banner5.png",
];
type HeroBannerProps = {
  restaurantName: string;
  tableNumber: number;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  cartCount: number;
  onCartClick: () => void;
};

export function HeroBanner({
  restaurantName,
  tableNumber,
  query,
  setQuery,
  cartCount,
  onCartClick,
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  
  const [loginOpen, setLoginOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
  const saved = localStorage.getItem("customer");

  if (saved) {
    const customer = JSON.parse(saved);
    setCustomerName(customer.name);
  }
}, []);

  return (
    <section className="w-full bg-[#FAF8F3]">

      {/* Top Header */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white px-4 py-4 shadow-lg md:flex-nowrap md:gap-4 md:px-5">

          {/* Logo */}
          <Image
            src="/images/LOGO.png"
            alt="Urban Theka"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />

          {/* Brand */}
          <h1 className="text-lg font-black tracking-wide md:text-2xl">
            <span className="text-black">URBAN</span>{" "}
            <span className="text-[#F59E0B]">THEKA</span>
          </h1>

          {/* Search */}
          <div className="order-3 w-full md:order-none md:ml-auto md:max-w-md md:flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
  type="text"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search Items..."
  className="h-11 w-full rounded-full border border-gray-200 bg-[#FAF8F3] pl-11 pr-4 outline-none focus:border-[#F59E0B]"
/>
          </div>

          {/* Login */}
          <div className="relative z-50">

  <button
    onClick={() => {
      if (customerName) {
        setMenuOpen(!menuOpen);
      } else {
        setLoginOpen(true);
      }
    }}
    className="flex items-center gap-2 rounded-full px-4 py-2 transition hover:bg-orange-50"
  >
    <User size={20} />

    <span className="font-semibold">
      {customerName || "Login"}
    </span>

    {customerName && <span>▼</span>}
  </button>

  {menuOpen && (
    <div className="absolute right-0 top-full z-[9999] mt-3 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">

      <button
  onClick={() => {
    setMenuOpen(false);
    setProfileOpen(true);
  }}
  className="w-full rounded-xl px-4 py-3 text-left hover:bg-gray-100"
>
  👤 My Profile
</button>

      <button
  onClick={() => {
    setMenuOpen(false);
    window.location.href = "/orders";
  }}
  className="w-full rounded-xl px-4 py-3 text-left hover:bg-gray-100"
>
  📦 My Orders
</button>

      <button
  onClick={() => {
    setMenuOpen(false);
    alert("Address Book Coming Soon");
  }}
  className="w-full rounded-xl px-4 py-3 text-left hover:bg-gray-100"
>
  📍 Saved Addresses
</button>

      <button
        onClick={() => {
  localStorage.removeItem("customer");
  setCustomerName("");
  setMenuOpen(false);
  setProfileOpen(false);
  setLoginOpen(false);
}}
        className="w-full rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
      >
        🚪 Logout
      </button>

    </div>
  )}

</div>

          {/* Cart */}
          <button
  onClick={onCartClick}
  className="relative flex items-center gap-2 rounded-full bg-[#F59E0B] px-3 py-2 md:px-5 font-semibold text-white transition hover:bg-orange-600"
>

  <ShoppingBag size={20} />

  <span>Cart</span>

  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
    {cartCount}
  </span>

</button>

        </div>
      </div>

      {/* Offer Slider */}
      <div className="mx-auto mt-4 max-w-4xl px-4">
        <div className="relative h-[170px] w-full md:h-[220px] lg:h-[260px]">

  <Image
    src={banners[current]}
    alt="Offer Banner"
    fill
    priority
    sizes="100vw"
    className="rounded-3xl object-cover object-center transition-all duration-700"
  />

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`transition-all ${
                  current === index
                    ? "h-2 w-8 rounded-full bg-[#F59E0B]"
                    : "h-2 w-2 rounded-full bg-white/70"
                }`}
              />
            ))}
          </div>

        </div>
      </div>
<CustomerLoginModal
  open={loginOpen}
  onClose={() => setLoginOpen(false)}
  onLogin={(name) => setCustomerName(name)}
/>
<CustomerProfileModal
  open={profileOpen}
  onClose={() => setProfileOpen(false)}
/>
    </section>
  );
}
