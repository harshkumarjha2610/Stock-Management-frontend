import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";

const monthsData = [
  { label: "Jan", active: false },
  { label: "Feb", active: false },
  { label: "Mar", active: false },
  { label: "Apr", active: false },
  { label: "May", active: false },
  { label: "Jun", active: true },
  { label: "Jul", active: false },
  { label: "Aug", active: false },
  { label: "Sep", active: false },
  { label: "Oct", active: false },
];

const nftPerformanceData = [
  {
    label: "Lorem Ipsum",
    value: "$32,567",
    percentage: "+8%",
    image: "/group-8.png",
  },
  {
    label: "Lorem Ipsum",
    value: "$10,567",
    percentage: "+3%",
    image: "/group-9.png",
  },
  {
    label: "Other",
    value: "$2,567",
    percentage: "+24%",
    image: "/group-10.png",
  },
];

const tokenBalanceData = [
  {
    color: "bg-[#ef6b23]",
    label: "Bored Ape Yacht Club",
    percentage: "40%",
    value: "$6.100",
  },
  {
    color: "bg-[#ff6e03]",
    label: "CryptoPunks",
    percentage: "25%",
    value: "$3.100",
  },
  {
    color: "bg-[#ff7d01]",
    label: "Decentraland (Land)",
    percentage: "15%",
    value: "$2.287",
  },
  {
    color: "bg-[#ff8e01]",
    label: "Axie infinity (Axies)",
    percentage: "10%",
    value: "$1.525",
  },
  {
    color: "bg-[#ff9e01]",
    label: "Other",
    percentage: "10%",
    value: "$1.525",
  },
];

export const SummaryInfoSection = (): React.ReactElement => {
  return (
    <section className="flex flex-col w-full items-start justify-center gap-5 py-0 rounded-[20px] overflow-hidden border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <header className="flex items-center justify-between pl-[25px] pr-5 py-5 w-full border-b [border-bottom-style:solid] border-[#e4e4e4] bg-[#3a3a3a]">
  <h1 className="[font-family:'Dubai-Bold',Helvetica] font-bold text-2xl text-white tracking-[0] leading-[normal]">
    Total Invested
  </h1>

  <div className="inline-flex items-center rounded-[20px] border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
    <div className="inline-flex items-center justify-center gap-[5px] pl-[15px] pr-2.5 py-[5px] bg-[#231f1f] rounded-[20px_0px_0px_20px] backdrop-blur-[15px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(15px)_brightness(100%)]">
      <span className="[font-family:'Dubai-Medium',Helvetica] font-medium text-white text-[23px] tracking-[0] leading-[39.1px] whitespace-nowrap">
        Fiat Wallet
      </span>

      <span className="mt-[-0.50px] [font-family:'Dubai-Regular',Helvetica] font-normal text-white text-[25px] tracking-[0] leading-[42.5px] whitespace-nowrap">
        :
      </span>

      <span className="mt-[-1.00px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[25px] tracking-[0] leading-[normal]">
        $9,385.34
      </span>
    </div>

    <div className="inline-flex items-center justify-center gap-[5px] pl-2.5 pr-[15px] py-[5px] bg-[#231f1f] rounded-[0px_20px_20px_0px] border-l [border-left-style:solid] backdrop-blur-[15px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(15px)_brightness(100%)] mt-[-1.00px] border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[0px_20px_20px_0px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <span className="[font-family:'Dubai-Medium',Helvetica] font-medium text-white text-[23px] tracking-[0] leading-[39.1px] whitespace-nowrap">
        Token Value
      </span>

      <span className="mt-[-0.50px] [font-family:'Dubai-Regular',Helvetica] font-normal text-white text-[25px] tracking-[0] leading-[42.5px] whitespace-nowrap">
        :
      </span>

      <span className="[font-family:'Dubai-Medium',Helvetica] font-medium text-[25px] text-white tracking-[0] leading-[normal]">
        $2,578.32
      </span>
    </div>
  </div>
</header>


      <div className="flex flex-col items-start gap-2.5 px-5 py-0 w-full">
        <Card className="flex flex-col items-start gap-[25px] px-6 py-[15px] w-full mt-[-1.00px] mb-[-1.00px] ml-[-1.00px] mr-[-1.00px] rounded-[20px] overflow-hidden border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="p-0 w-full">
            <div className="justify-between flex items-center w-full">
              <h2 className="mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                NFT
              </h2>

              <Button
                variant="ghost"
                className="flex-col inline-flex items-center justify-center gap-[8.23px] px-[15px] py-[5px] h-auto bg-[#ffffff33] rounded-[82.26px] border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[82.26px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#ffffff40]"
              >
                <div className="inline-flex items-center justify-center gap-[3px]">
                  <span className="mt-[-0.32px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[normal]">
                    Realized
                  </span>

                  <ChevronDownIcon className="w-5 h-5 text-white" />
                </div>
              </Button>
            </div>

            <div className="relative w-full h-[180px]">
              <div className="w-full gap-7 absolute top-[156px] left-0 flex items-center">
                {monthsData.map((month, index) => (
                  <button
                    key={index}
                    className={`h-6 justify-center gap-2.5 px-2.5 py-0.5 flex-1 flex items-center relative ${
                      month.active ? "" : ""
                    }`}
                  >
                    <div
                      className={`absolute w-full h-full top-0 left-0 rounded-[25px] ${
                        month.active
                          ? "bg-[#ef6b23]"
                          : "border-[none] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[25px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                      }`}
                    />

                    <span
                      className={`relative [font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-xs tracking-[0] leading-[normal] ${
                        month.active ? "[font-family:'Poppins',Helvetica]" : ""
                      }`}
                    >
                      {month.label}
                    </span>
                  </button>
                ))}
              </div>

              <img
                className="h-[77.78%] top-0 absolute w-full left-0"
                alt="Graphic"
                src="/graphic.svg"
              />

              <img
                className="h-[49.44%] top-[18.33%] absolute w-full left-0"
                alt="Graphic"
                src="/graphic-1.svg"
              />

              <img
                className="absolute w-0 h-[67.22%] top-[19.44%] left-[55.11%]"
                alt="Line"
                src="/line.svg"
              />

              <div className="flex w-[77px] items-center gap-2.5 pt-[5px] pb-2.5 px-[11px] absolute top-1.5 left-[calc(50.00%_+_6px)]">
                <img
                  className="absolute w-[100.00%] h-[100.28%] top-[-11.71%] left-[-8.92%]"
                  alt="Background"
                  src="/background.svg"
                />

                <span className="relative mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-[#121212] text-[15px] tracking-[0] leading-[normal]">
                  $4,892
                </span>
              </div>

              <div className="absolute w-0 h-[7.78%] top-[52.17%] left-[54.26%] bg-white rounded-[7.51px/7px]" />
            </div>

            <div className="inline-flex items-center gap-[9px]">
              <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-[normal]">
                $34,742.00
              </span>

              <span className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-[#f7f7f7] text-sm tracking-[0] leading-[normal]">
                This is $54.00 less than last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-5 px-5 py-0 w-full">
        <Card className="flex flex-col w-[406px] items-start gap-5 p-5 self-stretch rounded-3xl border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-3xl before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="p-0 w-full">
            <div className="justify-between flex items-center w-full">
              <h2 className="mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                NFT
              </h2>

              <Button
                variant="ghost"
                className="flex-col inline-flex items-center justify-center gap-[8.23px] px-[15px] py-[5px] h-auto bg-[#ffffff33] rounded-[82.26px] border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[82.26px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[#ffffff40]"
              >
                <div className="inline-flex items-center justify-center gap-[3px]">
                  <span className="mt-[-0.32px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[normal]">
                    Monthly
                  </span>

                  <ChevronDownIcon className="w-5 h-5 text-white" />
                </div>
              </Button>
            </div>

            <div className="flex flex-col items-start gap-[15px] w-full">
              {nftPerformanceData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start gap-2 w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex w-[245.5px] gap-[5px] items-center">
                      <span className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal]">
                        {item.label}
                      </span>

                      <span className="mt-[-1.00px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                        {item.value}
                      </span>
                    </div>

                    <span className="[font-family:'Inter',Helvetica] font-semibold text-[#49ab3e] text-base text-right tracking-[0] leading-[normal] whitespace-nowrap">
                      {item.percentage}
                    </span>
                  </div>

                  <img
                    className="w-full h-[62px] mb-[-1.00px] ml-[-1.00px] mr-[-1.00px]"
                    alt="Group"
                    src={item.image}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-start gap-[15px] px-4 py-[15px] flex-1 self-stretch mb-[-1.00px] mr-[-1.00px] rounded-[20px] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] mt-[-1.00px] border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="p-0 w-full">
            <div className="flex items-center w-full">
              <h2 className="mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                Token Balance
              </h2>
            </div>

            <div className="flex flex-col items-center gap-[17px] w-full">
              <div className="relative w-[317px] h-[152px]">
                <img
                  className="absolute top-1 left-0 w-[317px] h-[148px]"
                  alt="Ellipse"
                  src="/ellipse-3328.svg"
                />

                <img
                  className="absolute top-1 left-0 w-[317px] h-[148px]"
                  alt="Ellipse"
                  src="/ellipse-3331.svg"
                />

                <img
                  className="absolute top-1 left-0 w-[317px] h-[148px]"
                  alt="Ellipse"
                  src="/ellipse-3330.svg"
                />

                <img
                  className="absolute top-1 left-0 w-[317px] h-[148px]"
                  alt="Ellipse"
                  src="/ellipse-3332.svg"
                />

                <img
                  className="absolute top-3.5 left-0 w-[317px] h-[138px]"
                  alt="Ellipse"
                  src="/ellipse-3329.svg"
                />

                <div className="inline-flex flex-col h-[51px] items-center gap-[10.23px] absolute top-[calc(50.00%_+_20px)] left-[calc(50.00%_-_46px)]">
                  <span className="mt-[-1.53px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[17.9px] tracking-[0] leading-[36.6px] whitespace-nowrap">
                    Total
                  </span>

                  <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[25.6px] tracking-[0] leading-[36.6px] whitespace-nowrap">
                    $15.250
                  </span>

                  <div className="w-[93px] h-[19.17px] mb-[-19.63px] opacity-50" />
                </div>
              </div>

              <img
                className="w-full h-px object-cover"
                alt="Vector"
                src="/vector-2.svg"
              />

              <div className="flex flex-col items-start gap-[15px] w-full">
                {tokenBalanceData.map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2.5 px-[5px] py-0 rotate-[0.07deg]"
                  >
                    <div className="inline-flex gap-[5px] items-center">
                      <div
                        className={`w-[15px] h-[15px] ${item.color} rounded-[3px]`}
                      />

                      <span className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        {item.label} :
                      </span>

                      <span className="[font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        {item.percentage}
                      </span>
                    </div>

                    <span className="mt-[-0.50px] [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-[19px] text-center tracking-[0] leading-6 whitespace-nowrap">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
