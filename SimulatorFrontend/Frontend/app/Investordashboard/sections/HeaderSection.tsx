'use client';
import { BellIcon, SettingsIcon, UserIcon, Menu, X } from "lucide-react";
import React, { JSX, useState } from "react";
import { Button } from "../../components/button";

const navigationItems = [
  { label: "Investor Dashboard", active: true },
  { label: "Wallet", active: false },
  { label: "Community", active: false },
];

export const HeaderSection = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Black top strip */}
      <div className="w-full h-4 sm:h-5 lg:h-6 bg-black" />

      <header
        className="
          w-full
          max-w-[98vw]
          sm:max-w-[97vw]
          md:max-w-[96vw]
          lg:max-w-[1230px]
          xl:max-w-[1600px]
          2xl:max-w-[1850px]
          mx-auto
          bg-[#3a3a3a]
          rounded-[15px] sm:rounded-[20px] lg:rounded-[30px]
          overflow-hidden
          relative
          mt-1 sm:mt-2 lg:mt-2
        "
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[26px] py-3 sm:py-4 lg:py-5 gap-2 sm:gap-4">
          {/* Logo Section */}
          <div className="flex-shrink-0 w-[120px] sm:w-[160px] lg:w-[200px] xl:w-[237px]">
            <img
              className="w-full h-[30px] sm:h-[40px] lg:h-[50px] object-contain"
              alt="Co build logo"
              src="/co-build-logo-01-1.png"
            />
          </div>

          {/* Desktop Navigation Section */}
          <nav className="hidden lg:flex items-center gap-3 ml-4">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  h-[60px]           /* taller */
                  px-8 py-4          /* more padding */
                  rounded-[22px]
                  transition-colors
                  ${item.active
                    ? "bg-[#ef6b23] hover:bg-[#d95e1f]"
                    : "hover:bg-[#4a4a4a]"
                  }
                `}
              >
                <span className="font-normal text-white text-base whitespace-nowrap">
                  {item.label}
                </span>
              </Button>
            ))}
          </nav>

          {/* Desktop Icon Section */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
            >
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] lg:w-[50px] lg:h-[50px] rounded-full hover:bg-[#4a4a4a]"
            >
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] rounded-full hover:bg-[#4a4a4a]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#2a2a2a] border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-[#ef6b23] hover:bg-[#d95e1f]"
                      : "hover:bg-[#4a4a4a]"
                  }`}
                >
                  <span className="font-normal text-white text-sm sm:text-base">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="md:hidden flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
              >
                <BellIcon className="w-5 h-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
              >
                <UserIcon className="w-5 h-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-[45px] h-[45px] rounded-full hover:bg-[#4a4a4a]"
              >
                <SettingsIcon className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
