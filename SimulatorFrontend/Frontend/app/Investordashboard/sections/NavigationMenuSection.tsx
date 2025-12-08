import React, { JSX } from "react";
import { Button } from "../../components/button";

const navigationItems = [
  {
    icon: "/frame-1000003212.svg",
    label: "My Projects",
  },
  {
    icon: "/frame-1000003212-1.svg",
    label: "Smart Contact (Log)",
  },
];

export const NavigationMenuSection = (): JSX.Element => {
  return (
    <nav className="flex w-full justify-center gap-[15px] items-center">
      {navigationItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="gap-[11px] p-[15px] bg-[#ef6b23cc] rounded-[14px] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] flex items-center flex-1 border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[14px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#ef6b23cc] h-auto"
        >
          <img
            className="relative flex-[0_0_auto]"
            alt={item.label}
            src={item.icon}
          />
          <span className="relative flex items-center justify-center flex-1 [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-[normal]">
            {item.label}
          </span>
        </Button>
      ))}
    </nav>
  );
};
