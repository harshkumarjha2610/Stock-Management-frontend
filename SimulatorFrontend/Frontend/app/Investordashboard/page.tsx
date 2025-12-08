import React, { JSX } from "react";
import { HeaderSection } from "./sections/HeaderSection";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";
import { SummaryInfoSection } from "./sections/SummaryInfoSection";
import { SummaryInfoWrapperSection } from "./sections/SummaryInfoWrapperSection";
import { TransactionHistorySection } from "./sections/TransactionHistorySection";


export default function InvestorDashboard() {
  return (
    <div className="bg-black w-full min-w-[1920px] min-h-screen relative">
      <HeaderSection />


      <div className="flex gap-4 px-[22px] pt-6">
        <div className="flex flex-col gap-4 flex-1 mt-24">
          <SummaryInfoSection />
          <TransactionHistorySection />
        </div>


        <div className="flex flex-col gap-4">
          <NavigationMenuSection />
          <SummaryInfoWrapperSection />
        </div>
      </div>
    </div>
  );
}
