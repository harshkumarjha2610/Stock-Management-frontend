import { BellIcon, SettingsIcon, UserIcon } from "lucide-react";
import React, { JSX } from "react";
import { Button } from "../../components/button";

const navigationItems = [
  { label: "Investor Dashboard", active: true },
  { label: "Wallet", active: false },
  { label: "Community", active: false },
];

export const HeaderSection = (): JSX.Element => {
  return (
    <header className="w-full bg-[#3a3a3a] rounded-[30px] overflow-hidden relative">
      <div className="flex items-center justify-between px-[26px] py-5 gap-4">
        {/* Logo Section */}
        <div className="flex-shrink-0 w-[237px]">
          <img
            className="w-full h-[50px] object-cover"
            alt="Co build logo"
            src="/co-build-logo-01-1.png"
          />
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center gap-2.5">
          {navigationItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-[50px] px-6 py-3 rounded-[25px] transition-colors ${
                item.active
                  ? "bg-[#ef6b23] hover:bg-[#d95e1f]"
                  : "hover:bg-[#4a4a4a]"
              }`}
            >
              <span className="font-normal text-white text-base">
                {item.label}
              </span>
            </Button>
          ))}
        </nav>

        {/* Icon Section */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-[50px] h-[50px] rounded-full hover:bg-[#4a4a4a]"
          >
            <BellIcon className="w-6 h-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-[50px] h-[50px] rounded-full hover:bg-[#4a4a4a]"
          >
            <UserIcon className="w-6 h-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-[50px] h-[50px] rounded-full hover:bg-[#4a4a4a]"
          >
            <SettingsIcon className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </header>
  );
};
