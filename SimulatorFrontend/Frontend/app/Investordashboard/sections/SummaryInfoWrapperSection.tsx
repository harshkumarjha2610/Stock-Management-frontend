import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Badge } from "../../components/badge";
import { Card, CardContent } from "../../components/card";

const performanceMetrics = [
  {
    title: "Portfolio Value",
    value: "$150,000 USD",
    change: "8.5% Vs Last Month",
    chartSrc: "/grafik.png",
    chartWidth: "w-[186.73px]",
    chartHeight: "h-[45.85px]",
  },
  {
    title: "Total ROI",
    value: "+25.0%",
    change: "2.1% Today",
    chartSrc: "/grafik-1.png",
    chartWidth: "w-[230.73px]",
    chartHeight: "h-[45.85px]",
  },
  {
    title: "UNREALIZED P/L",
    value: "+$30,000 USD",
    change: "$2,500 Today",
    chartSrc: "/grafik-2.png",
    chartWidth: "w-[216.73px]",
    chartHeight: "h-[45.85px]",
  },
];

const portfolioAllocationData = [
  {
    label: "NFT",
    percentage: "60%",
    value: "$90k",
    color: "bg-[#ef6b23]",
  },
  {
    label: "Fungible Tokens",
    percentage: "60%",
    value: "$90k",
    color: "bg-[#de6320]",
  },
];

const tokenBalanceData = [
  {
    name: "Bored Ape Yacht Club",
    percentage: "40%",
    value: "$6.100",
    color: "bg-[#ef6b23]",
  },
  {
    name: "CryptoPunks",
    percentage: "25%",
    value: "$3.100",
    color: "bg-[#ff6e03]",
  },
  {
    name: "Decentraland (Land)",
    percentage: "15%",
    value: "$2.287",
    color: "bg-[#ff7d01]",
  },
  {
    name: "Axie infinity (Axies)",
    percentage: "10%",
    value: "$1.525",
    color: "bg-[#ff8e01]",
  },
  {
    name: "Other",
    percentage: "10%",
    value: "$1.525",
    color: "bg-[#ff9e01]",
  },
];

const portfolioTableData = [
  {
    asset: "Crypto Punks",
    purchasePrice: "$10,000",
    currentPrice: "$22,000",
    roi: "+120%",
    change24h: "+5%",
  },
  {
    asset: "Decentraland (Land)",
    purchasePrice: "$5,000",
    currentPrice: "$6,000",
    roi: "+20%",
    change24h: "+2%",
  },
  {
    asset: "Axie Infinity (Axies)",
    purchasePrice: "$1,000",
    currentPrice: "$700",
    roi: "-30%",
    change24h: "+1%",
  },
];

const futurePlantData = [
  {
    category: "Today",
    items: [
      {
        title: "The Sandbox LAND",
        description:
          "Potential 15% value increase from Alpha Season 4 (Q4 2025).",
        time: "11 : 23",
      },
    ],
  },
  {
    category: "Yesterday",
    items: [
      {
        title: "Axie Infinity",
        description:
          "Estimated airdrop of 50 AXS per Axie for holders (Q3 2025).",
        time: "11 : 23",
      },
      {
        title: "CryptoPunks",
        description:
          "Metaverse integration and potential 20% value increase (Q1 2026).",
        time: "11 : 23",
      },
    ],
  },
];

export const SummaryInfoWrapperSection: React.FC = () => {
  return (
    <section className="flex flex-col w-full items-center gap-5 pt-0 pb-[30px] px-0 rounded-[20px] overflow-hidden border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
      <header className="flex items-center gap-[15px] pl-[25px] pr-5 pt-5 pb-2.5 w-full">
        <h2 className="mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-[25px] text-white tracking-[0] leading-[normal]">
          Digital Asset Performance / Investment Performance
        </h2>
      </header>

      <div className="flex items-center gap-[15px] px-5 py-0 w-full">
        {performanceMetrics.map((metric, index) => (
          <Card
            key={index}
            className="flex-col gap-[15px] px-[20.97px] py-[15px] rounded-[14.68px] backdrop-blur-[15px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(15px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] flex items-center flex-1 border-[none] before:content-[''] before:absolute before:inset-0 before:p-[1.05px] before:rounded-[14.68px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
          >
            <CardContent className="inline-flex flex-col items-start justify-center gap-[12.58px] p-0">
              <div className="flex items-center justify-center gap-[5px] w-full">
                <div className="flex items-center justify-center w-fit mt-[-1.05px] [font-family:'Dubai-Regular',Helvetica] font-normal text-white text-xl text-center tracking-[0] leading-[normal]">
                  {metric.title}
                </div>
              </div>

              <div className="inline-flex flex-col items-center gap-2">
                <div className="w-fit mt-[-1.00px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-xl tracking-[0] leading-4 whitespace-nowrap">
                  {metric.value}
                </div>

                <div className="inline-flex items-center justify-center gap-[3px]">
                  <img
                    className="w-6 h-6"
                    alt="Frame"
                    src="/frame-1.svg"
                  />

                  <div className="w-fit [font-family:'Inter',Helvetica] font-normal text-[#efefef] text-[17px] tracking-[0] leading-[normal]">
                    {metric.change}
                  </div>
                </div>
              </div>
            </CardContent>

            <img
              className={`${metric.chartWidth} ${metric.chartHeight}`}
              alt="Grafik"
              src={metric.chartSrc}
            />
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-5 px-5 py-0 w-full">
        <Card className="flex flex-col items-center gap-[15px] px-9 py-[15px] flex-1 rounded-3xl border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-3xl before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="flex flex-col items-center gap-[15px] p-0 w-full">
            <div className="justify-between flex items-center w-full">
              <h3 className="w-fit mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                Portfolio Application
              </h3>

              <Badge className="flex-col inline-flex items-center justify-center gap-[8.23px] px-[15px] py-[5px] h-auto bg-[#ffffff33] rounded-[82.26px] border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[82.26px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
                <div className="inline-flex items-center justify-center gap-[3px]">
                  <span className="w-fit mt-[-0.32px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[normal]">
                    Realized
                  </span>

                  <img
                    className="w-5 h-5"
                    alt="Frame"
                    src="/frame.svg"
                  />
                </div>
              </Badge>
            </div>

            <div className="w-fit [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[25px] tracking-[0] leading-[normal]">
              Total $150,000
            </div>

            <div className="inline-flex items-center gap-[18.33px]">
              <div className="relative w-[203.42px] h-[203.42px]">
                <img
                  className="absolute top-0 left-[102px] w-[102px] h-[197px]"
                  alt="Ellipse"
                  src="/ellipse-64.svg"
                />

                <img
                  className="absolute top-0 left-0 w-[147px] h-[203px]"
                  alt="Ellipse"
                  src="/ellipse-66.svg"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-[25px] w-full">
              {portfolioAllocationData.map((item, index) => (
                <div
                  key={index}
                  className="inline-flex flex-col items-center gap-[5px]"
                >
                  <div className="inline-flex items-center justify-center gap-[5px]">
                    <div
                      className={`${item.color} rotate-[0.07deg] w-[15px] h-[15px] rounded-[3px]`}
                    />

                    <div className="w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                      {item.label}
                    </div>
                  </div>

                  <div className="w-fit [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                    {item.percentage} {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-start gap-[15px] px-4 py-[15px] flex-1 self-stretch mb-[-1.00px] mr-[-1.00px] rounded-[20px] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] mt-[-1.00px] border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="flex flex-col items-start gap-[15px] p-0 w-full">
            <div className="flex items-center w-full">
              <h3 className="w-fit mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                Token Balance
              </h3>
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
                  <div className="w-fit mt-[-1.53px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[17.9px] tracking-[0] leading-[36.6px] whitespace-nowrap">
                    Total
                  </div>

                  <div className="w-fit [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[25.6px] tracking-[0] leading-[36.6px] whitespace-nowrap">
                    $15.250
                  </div>

                  <div className="w-[93px] h-[19.17px] mb-[-19.63px] opacity-50" />
                </div>
              </div>

              <img
                className="w-full h-px object-cover"
                alt="Vector"
                src="/vector-2.svg"
              />

              <div className="flex flex-col items-start gap-[15px] w-full">
                {tokenBalanceData.map((token, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2.5 px-[5px] py-0 rotate-[0.07deg]"
                  >
                    <div className="inline-flex gap-[5px] items-center">
                      <div
                        className={`w-[15px] h-[15px] ${token.color} rounded-[3px]`}
                      />

                      <div className="w-fit [font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        {token.name} :
                      </div>

                      <div className="w-fit [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        {token.percentage}
                      </div>
                    </div>

                    <div className="w-fit mt-[-0.50px] [font-family:'Satoshi-Bold',Helvetica] font-bold text-white text-[19px] text-center tracking-[0] leading-6 whitespace-nowrap">
                      {token.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col w-[875px] items-start gap-[23px] pt-5 pb-[100px] px-5 rounded-[20px] border-[none] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <CardContent className="flex flex-col items-start gap-[23px] p-0 w-full">
          <div className="justify-between flex items-center w-full">
            <h3 className="w-fit mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
              Portfolio Application
            </h3>
          </div>

          <div className="flex flex-col items-start gap-[5px] w-full">
            <div className="flex h-[58px] px-2.5 py-1.5 w-full bg-[#303030] rounded-[10px] items-center">
              <div className="flex items-center justify-center gap-[9.55px] p-[9.55px] flex-1">
                <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-white text-[15px] text-center tracking-[0] leading-[18.1px]">
                  Asset
                </div>
              </div>

              <div className="flex items-center justify-center gap-[9.55px] pl-1.5 pr-[9.55px] py-[9.55px] flex-1">
                <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-white text-[15px] text-center tracking-[0] leading-[18.1px]">
                  Purchase Price
                </div>
              </div>

              <div className="flex items-center justify-center gap-[9.55px] p-[9.55px] flex-1">
                <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-white text-[15px] text-center tracking-[0] leading-[18.1px]">
                  Current Price
                </div>
              </div>

              <div className="flex items-center justify-center gap-[9.55px] p-[9.55px] flex-1">
                <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-white text-[15px] text-center tracking-[0] leading-[18.1px]">
                  ROI (%)
                </div>
              </div>

              <div className="flex items-center justify-center gap-[9.55px] p-[9.55px] flex-1">
                <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-white text-[15px] text-center tracking-[0] leading-[18.1px]">
                  24 Hour Change
                </div>
              </div>
            </div>

            {portfolioTableData.map((row, index) => (
              <div
                key={index}
                className="flex flex-col items-start px-[9px] py-0 w-full bg-[#ffffffb2] rounded-[10px] opacity-65"
              >
                <div className="flex items-center w-full rounded-[10px]">
                  <div className="flex flex-col items-center justify-center gap-[11.45px] px-[9.55px] py-2.5 flex-1">
                    <div className="inline-flex items-center gap-3">
                      <div className="mt-[-1.00px] [font-family:'Inter',Helvetica] font-medium text-black text-sm leading-[22.4px] w-fit tracking-[0] whitespace-nowrap">
                        {row.asset}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-[11.45px] px-[9.55px] py-2.5 flex-1">
                    <div className="inline-flex items-center gap-[9.55px]">
                      <div className="w-fit mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-black text-[15px] tracking-[0] leading-[18.1px] whitespace-nowrap">
                        {row.purchasePrice}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-[11.45px] px-[9.55px] py-2.5 flex-1">
                    <div className="flex items-center gap-[18.14px] w-full">
                      <div className="flex-1 mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-black text-[15px] text-center tracking-[0] leading-[18.1px]">
                        {row.currentPrice}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-[11.45px] px-[9.55px] py-2.5 flex-1">
                    <div className="w-fit mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-black text-[15px] tracking-[0] leading-[18.1px] whitespace-nowrap">
                      {row.roi}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-[11.45px] px-[9.55px] py-2.5 flex-1">
                    <div className="w-fit mt-[-0.95px] [font-family:'Inter',Helvetica] font-medium text-black text-[15px] tracking-[0] leading-[18.1px] whitespace-nowrap">
                      {row.change24h}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start gap-2.5 px-5 py-0 w-full">
        <Card className="flex flex-col items-start gap-5 p-5 w-full mt-[-1.00px] mb-[-1.00px] ml-[-1.00px] mr-[-1.00px] rounded-[15px] overflow-hidden border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(119deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.05)_100%)] before:content-[''] before:absolute before:inset-0 before:p-0 before:rounded-[15px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <CardContent className="flex flex-col items-start gap-5 p-0 w-full">
            <div className="justify-between flex items-center w-full">
              <h3 className="w-fit mt-[-1.00px] [font-family:'Dubai-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[normal]">
                Estimated Future Plant
              </h3>

              <div className="inline-flex items-center justify-center gap-2.5">
                <img
                  className="w-[30px] h-[30px]"
                  alt="Icon filter"
                  src="/icon-filter-1.svg"
                />

                <Badge
                  className="inline-flex items-center justify-center gap-[8.23px] px-[15px] py-[5px] h-auto bg-[#ffffff33] rounded-[82.26px] border-[none] backdrop-blur-[20px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(20px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[82.26px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.5)_0%,rgba(255,
255,255,0)_43%,rgba(255,255,255,0.5)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                >
                  <img
                    className="w-5 h-5"
                    alt="Frame"
                    src="/frame-6.svg"
                  />

                  <div className="inline-flex items-center justify-center gap-[3px]">
                    <div className="w-fit mt-[-0.32px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-[normal]">
                      11 Nov - 11 Dec, 2026
                    </div>

                    <ChevronDownIcon className="w-5 h-5 text-white" />
                  </div>
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-end gap-[15px] w-full">
              {futurePlantData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="flex flex-col items-start gap-2.5 w-full">
                  <div className="mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-[15px] tracking-[0] leading-[normal] w-full">
                    {section.category}
                  </div>

                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-center gap-5 w-full"
                    >
                      <div
                        className={`${
                          sectionIndex === 1 && itemIndex === 1
                            ? "border-white"
                            : "border-[#c0c0c0]"
                        } flex items-center justify-between pt-0 pb-2.5 px-0 flex-1 border-b [border-bottom-style:solid]`}
                      >
                        <div className="flex-1 flex flex-col items-start gap-[3px]">
                          <div className="w-full mt-[-1.00px] [font-family:'Satoshi-Medium',Helvetica] font-medium text-white text-[15px] tracking-[0] leading-[normal]">
                            {item.title}
                          </div>

                          <div className="text-[#e2e2e2] w-full [font-family:'Satoshi-Regular',Helvetica] font-normal text-[15px] tracking-[0] leading-[normal]">
                            {item.description}
                          </div>
                        </div>

                        <div className="inline-flex items-center justify-center gap-2.5 p-2.5">
                          <div className="text-[#8a8a8f] text-sm w-fit mt-[-1.00px] [font-family:'Satoshi-Regular',Helvetica] font-normal text-right tracking-[0] leading-[normal]">
                            {item.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
