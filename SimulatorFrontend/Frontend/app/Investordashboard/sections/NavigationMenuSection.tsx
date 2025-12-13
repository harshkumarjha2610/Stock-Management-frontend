'use client';

import React, { JSX } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/button";

const navigationItems = [
  {
    icon: "/frame-1000003212.svg",
    label: "My Projects",
    href: "/projectdiscoveryenglish", // target route
  },
  {
    icon: "/frame-1000003212-1.svg",
    label: "Smart Contact (Log)",
    href: "", // no navigation yet
  },
];

export const NavigationMenuSection = (): JSX.Element => {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Welcome Section - Only visible on mobile */}
      <div className="flex sm:hidden items-center gap-3 px-4">
        <button className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>
        <div className="flex flex-col">
          <span className="text-white/60 text-sm font-medium">
            Welcome Back!
          </span>
          <span className="text-white text-lg font-semibold">Bimo</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex w-full justify-center gap-2 sm:gap-[15px] items-center flex-col sm:flex-row px-4 sm:px-0">
        {navigationItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => {
              if (item.href) router.push(item.href);
            }}
            className="relative gap-2 sm:gap-[11px] p-3 sm:p-[15px] bg-[#ef6b23cc] rounded-[14px] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] flex items-center w-full sm:flex-1 border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[14px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#ef6b23cc] h-auto"
          >
            <img
              className="relative flex-[0_0_auto] w-5 h-5 sm:w-auto sm:h-auto"
              alt={item.label}
              src={item.icon}
            />
            <span className="relative flex items-center justify-center flex-1 [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-base sm:text-xl tracking-[0] leading-[normal]">
              {item.label}
            </span>
          </Button>
        ))}
      </nav>
    </div>
  );
};
