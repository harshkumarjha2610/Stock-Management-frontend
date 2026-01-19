'use client';

import React, { JSX } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/button";

const navigationItems = [
  {
    icon: "/frame-1000003212.svg",
    label: "My Projects",
    href: "/projectdiscoveryenglish",
  },
  {
    icon: "/frame-1000003212-1.svg",
    label: "Smart Contract (Log)",
    href: "",
  },
];

export const NavigationMenuSection = (): JSX.Element => {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Welcome Section - Only visible on mobile, hidden on sm and above */}
      <div className="flex sm:hidden items-center gap-3 px-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
          aria-label="Go back"
        >
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
              d="M15 19l-7-7 7-7"
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

      {/* Navigation Buttons - Always horizontal with reduced width */}
      <nav
        className="
          flex
          flex-row
          w-full sm:w-auto
          justify-center sm:justify-end
          gap-2 sm:gap-2 md:gap-2.5
          items-center
          px-4 sm:px-0
          mt-6 sm:-mt-12 md:-mt-16 lg:-mt-20
          sm:ml-auto
        "
      >
        {navigationItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => {
              if (item.href) router.push(item.href);
            }}
            className="
              relative 
              gap-1.5 sm:gap-2.5 
              px-3 sm:px-5 md:px-6 lg:px-7
              py-3.5 sm:py-4.5 md:py-5 lg:py-5.5
              bg-[#f46e24cc]
              hover:bg-[#f46e24e6]
              active:bg-[#f46e24]
              rounded-lg sm:rounded-xl
              flex items-center justify-center
              flex-1 sm:flex-initial
              sm:min-w-[180px] sm:max-w-[240px] md:max-w-[280px]
              border-none
              shadow-none
              transition-colors duration-300
              h-auto
              min-h-[56px] sm:min-h-[68px] md:min-h-[72px] lg:min-h-[76px]
            "
          >
            <img
              className="relative flex-shrink-0 w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
              alt={item.label}
              src={item.icon}
            />
            <span className="relative [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-xs sm:text-base md:text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              {item.label}
            </span>
          </Button>
        ))}
      </nav>
    </div>
  );
};
