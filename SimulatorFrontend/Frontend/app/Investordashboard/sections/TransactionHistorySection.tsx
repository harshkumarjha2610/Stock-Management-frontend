import React, { JSX } from "react";
import { Button } from "../../components/button";

const todayTransactions = [
  {
    icon: "/investment-icon.svg",
    title: "Investment From Jan Doe",
    time: "11:23",
    amount: "$3.512.21",
    isPositive: true,
  },
];

const yesterdayTransactions = [
  {
    icon: "/investment-icon-2.svg",
    title: "Pay Out Jan Doe",
    time: "11:23",
    amount: "-$1.512.21",
    isPositive: false,
  },
  {
    icon: "/investment-icon-1.svg",
    title: "Staking Reward Jan Doe",
    time: "11:23",
    amount: "$1.512.21",
    isPositive: true,
  },
  {
    icon: "/investment-icon-2.svg",
    title: "Pay Out Jan Doe",
    time: "11:23",
    amount: "-$1.512.21",
    isPositive: false,
  },
  {
    icon: "/investment-icon-1.svg",
    title: "Staking Reward Jan Doe",
    time: "11:23",
    amount: "$1.512.21",
    isPositive: true,
  },
];

export const TransactionHistorySection = (): JSX.Element => {
  return (
    <section
      className="
        flex flex-col w-[calc(100%-60px)] items-start gap-[58px] p-5
        relative rounded-[15px] overflow-hidden bg-[#3a3a3a]
        min-h-[600px]
      "
    >
      <header className="justify-between flex items-center relative self-stretch w-full flex-[0_0_auto]">
        <h2 className="relative w-fit mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
          Transaction History
        </h2>

        <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-0 hover:bg-transparent"
          >
            <img
              className="relative w-[30px] h-[30px]"
              alt="Icon filter"
              src="/icon-filter.svg"
            />
          </Button>

          <Button
            variant="ghost"
            className="h-auto inline-flex items-center justify-center gap-[8.23px] px-[15px] py-[5px] relative flex-[0_0_auto] bg-[#ffffff33] rounded-[82.26px] border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[82.26px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#ffffff33]"
          >
            <img
              className="relative w-5 h-5"
              alt="Frame"
              src="/frame-6.svg"
            />

            <div className="inline-flex items-center justify-center gap-[3px] relative flex-[0_0_auto]">
              <span className="relative w-fit mt-[-0.32px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[normal]">
                11 Nov - 11 Dec, 2026
              </span>

              <img
                className="relative w-5 h-5"
                alt="Frame"
                src="/frame.svg"
              />
            </div>
          </Button>
        </div>
      </header>

      <div className="flex flex-col items-end gap-[15px] relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2.5 w-full flex-[0_0_auto] relative self-stretch">
          <h3 className="mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-[15px] tracking-[0] leading-[normal] relative self-stretch">
            Today
          </h3>

          {todayTransactions.map((transaction, index) => (
            <div
              key={`today-${index}`}
              className="flex items-center justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]"
            >
              <img
                className="relative w-10 h-10"
                alt="Investment icon"
                src={transaction.icon}
              />

              <div className="border-[#c7c7c7] flex items-center justify-between pt-0 pb-2.5 px-0 relative flex-1 grow border-b [border-bottom-style:solid]">
                <div className="w-[169px] flex flex-col items-start gap-[3px] relative">
                  <div className="mt-[-1.00px] text-white relative self-stretch [font-family:'Satoshi-Regular',Helvetica] font-normal text-[15px] tracking-[0] leading-[normal]">
                    {transaction.title}
                  </div>

                  <div className="relative self-stretch [font-family:'Satoshi-Regular',Helvetica] font-normal text-[#ebebeb] text-sm tracking-[0] leading-[normal]">
                    {transaction.time}
                  </div>
                </div>

                <div className="inline-flex items-center justify-center gap-2.5 p-2.5 relative flex-[0_0_auto]">
                  <div className="text-white text-[15px] relative w-fit mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-right tracking-[0] leading-[normal]">
                    {transaction.amount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <h3 className="mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-[15px] tracking-[0] leading-[normal] relative self-stretch">
            Yesterday
          </h3>

          {yesterdayTransactions.map((transaction, index) => (
            <div
              key={`yesterday-${index}`}
              className="flex items-center justify-center gap-5 relative self-stretch w-full flex-[0_0_auto]"
            >
              <img
                className="relative w-10 h-10"
                alt="Investment icon"
                src={transaction.icon}
              />

              <div className="border-[#c7c7c7] flex items-center justify-between pt-0 pb-2.5 px-0 relative flex-1 grow border-b [border-bottom-style:solid]">
                <div className="w-[169px] flex flex-col items-start gap-[3px] relative">
                  <div className="mt-[-1.00px] text-white relative self-stretch [font-family:'Satoshi-Regular',Helvetica] font-normal text-[15px] tracking-[0] leading-[normal]">
                    {transaction.title}
                  </div>

                  <div className="relative self-stretch [font-family:'Satoshi-Regular',Helvetica] font-normal text-[#ebebeb] text-sm tracking-[0] leading-[normal]">
                    {transaction.time}
                  </div>
                </div>

                <div className="inline-flex items-center justify-center gap-2.5 p-2.5 relative flex-[0_0_auto]">
                  <div className="text-white text-[15px] relative w-fit mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-right tracking-[0] leading-[normal]">
                    {transaction.amount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
