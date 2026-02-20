'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { HeaderSection } from "./sections/HeaderSection";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";
import { SummaryInfoSection } from "./sections/SummaryInfoSection";
import { SummaryInfoWrapperSection } from "./sections/SummaryInfoWrapperSection";
import { TransactionHistorySection } from "./sections/TransactionHistorySection";
import { FooterSection } from "./sections/FooterSection";

export default function InvestorDashboard() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-black w-full min-h-screen relative flex flex-col">
      <HeaderSection />

      {/* Mobile: Navigation first via order, Desktop: same row layout */}
      <div className="flex flex-col md:flex-row gap-4 px-4 md:px-[22px] pt-6 flex-1">
        {/* Left column (Back Button + Summary + Transactions) - stays left on desktop */}
        <div className="flex flex-col flex-1 mt-2 md:mt-8 md:order-1 order-2">
          {/* Back button - hidden on mobile, visible on desktop */}
          <button
            onClick={handleBack}
            className="hidden md:flex w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-600 hover:bg-orange-700 items-center justify-center transition-all shadow-lg self-start mb-6 -mt-4"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          {/* Content sections with gap */}
          <div className="flex flex-col gap-4">
            <SummaryInfoSection />
            <TransactionHistorySection />
          </div>
        </div>

        {/* Right column (Navigation + SummaryWrapper) */}
        <div className="flex flex-col gap-4 mt-4 md:mt-24 md:order-2 order-1">
          {/* Navigation menu moved up more */}
          <div className="-mt-3">
            <NavigationMenuSection />
          </div>
          {/* Wrapper section with increased compensating margin to stay in place */}
          <div className="mt-3">
            <SummaryInfoWrapperSection />
          </div>
        </div>
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
