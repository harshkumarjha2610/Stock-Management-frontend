import React from "react";
import { HeaderSection } from "./sections/HeaderSection";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";
import { SummaryInfoSection } from "./sections/SummaryInfoSection";
import { SummaryInfoWrapperSection } from "./sections/SummaryInfoWrapperSection";
import { TransactionHistorySection } from "./sections/TransactionHistorySection";

export default function InvestorDashboard() {
  return (
    <div className="bg-black w-full min-h-screen relative">
      <HeaderSection />

      {/* Mobile: Navigation first via order, Desktop: same row layout */}
      <div className="flex flex-col md:flex-row gap-4 px-4 md:px-[22px] pt-6">
        {/* Left column (Summary + Transactions) - stays left on desktop */}
        <div className="flex flex-col gap-4 flex-1 mt-4 md:mt-24 md:order-1 order-2">
          <SummaryInfoSection />
          <TransactionHistorySection />
        </div>

        {/* Right column (Navigation + SummaryWrapper) */}
        <div className="flex flex-col gap-4 mt-4 md:mt-24 md:order-2 order-1">
          <NavigationMenuSection />
          <SummaryInfoWrapperSection />
        </div>
      </div>
    </div>
  );
}
