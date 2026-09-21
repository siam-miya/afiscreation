"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [targetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });

  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();

    let timeLeft = {
      days: "03",
      hours: "23",
      minutes: "19",
      seconds: "56"
    };

    if (difference > 0) {
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      timeLeft = {
        days: d < 10 ? `0${d}` : `${d}`,
        hours: h < 10 ? `0${h}` : `${h}`,
        minutes: m < 10 ? `0${m}` : `${m}`,
        seconds: s < 10 ? `0${s}` : `${s}`,
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="my-1 flex w-full select-none items-center justify-center font-sans sm:my-2 sm:justify-start">
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-5">

        <div className="flex min-w-0 flex-col items-center">
          <span className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-800 sm:mb-1 sm:text-[10px] md:text-sm">
            Days
          </span>

          <span className="text-lg font-bold leading-none tracking-tight text-black sm:text-xl md:text-[32px]">
            {timeLeft.days}
          </span>
        </div>

        <div className="self-center pt-2 text-base font-bold text-secondary sm:pt-3 sm:text-lg md:pt-4 md:text-3xl">
          :
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <span className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-800 sm:mb-1 sm:text-[10px] md:text-sm">
            Hours
          </span>

          <span className="text-lg font-bold leading-none tracking-tight text-black sm:text-xl md:text-[32px]">
            {timeLeft.hours}
          </span>
        </div>

        <div className="self-center pt-2 text-base font-bold text-secondary sm:pt-3 sm:text-lg md:pt-4 md:text-3xl">
          :
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <span className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-800 sm:mb-1 sm:text-[10px] md:text-sm">
            Minutes
          </span>

          <span className="text-lg font-bold leading-none tracking-tight text-black sm:text-xl md:text-[32px]">
            {timeLeft.minutes}
          </span>
        </div>

        <div className="self-center pt-2 text-base font-bold text-secondary sm:pt-3 sm:text-lg md:pt-4 md:text-3xl">
          :
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <span className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-800 sm:mb-1 sm:text-[10px] md:text-sm">
            Seconds
          </span>

          <span className="text-lg font-bold leading-none tracking-tight text-primary sm:text-xl md:text-[32px]">
            {timeLeft.seconds}
          </span>
        </div>

      </div>
    </div>
  );
}