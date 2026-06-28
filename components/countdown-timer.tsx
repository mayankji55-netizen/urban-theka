"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  acceptedAt: string | null;
  estimatedMinutes: number | null;
};

export default function CountdownTimer({
  acceptedAt,
  estimatedMinutes,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    console.log("Countdown Mounted", {
      acceptedAt,
      estimatedMinutes,
    });

    if (!acceptedAt || !estimatedMinutes) {
      setTimeLeft("");
      return;
    }

    const update = () => {
      console.log("Tick", new Date().toLocaleTimeString());

      const endTime =
        new Date(acceptedAt).getTime() +
        estimatedMinutes * 60 * 1000;

      const diff = endTime - Date.now();

      if (diff <= 0) {
        setTimeLeft("⏰ Time Over");
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    update();

    const interval = setInterval(update, 1000);

    return () => {
      console.log("Countdown Unmounted");
      clearInterval(interval);
    };
  }, [acceptedAt, estimatedMinutes]);

   return (
  <div className="mt-1">
    <p className="text-sm font-bold text-red-600">
      ⏳ {timeLeft || "--:--"}
    </p>
  </div>
);
}