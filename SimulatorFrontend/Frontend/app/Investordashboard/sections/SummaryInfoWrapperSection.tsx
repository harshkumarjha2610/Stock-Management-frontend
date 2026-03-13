import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Badge } from "../../components/badge";
import { Card, CardContent } from "../../components/card";
import "./SummaryInfoWrapperSection.css";
import { PieChart, Pie, Cell } from "recharts";
const performanceMetrics = [
  {
    title: "Portfolio Value",
    value: "$150,000 USD",
    change: "8.5% Vs Last Month",
    chartSrc: "/grafik.png",
    chartWidth: "chart-width-1",
    chartHeight: "chart-height-1",
  },
  {
    title: "Total ROI",
    value: "+25.0%",
    change: "2.1% Today",
    chartSrc: "/grafik-1.png",
    chartWidth: "chart-width-2",
    chartHeight: "chart-height-2",
  },
  {
    title: "UNREALIZED P/L",
    value: "+$30,000 USD",
    change: "$2,500 Today",
    chartSrc: "/grafik-2.png",
    chartWidth: "chart-width-3",
    chartHeight: "chart-height-3",
  },
];

const portfolioAllocationData = [
  {
    label: "NFT",
    percentage: "60%",
    value: "$90k",
    color: "#ef6b23",
  },
  {
    label: "Fungible Tokens",
    percentage: "60%",
    value: "$90k",
    color: "#de6320",
  },
];

const tokenBalanceData = [
  {
    name: "Bored Ape Yacht Club",
    percentage: "40%",
    value: "$6.100",
    color: "#ef6b23",
  },
  {
    name: "CryptoPunks",
    percentage: "25%",
    value: "$3.100",
    color: "#ff6e03",
  },
  {
    name: "Decentraland (Land)",
    percentage: "15%",
    value: "$2.287",
    color: "#ff7d01",
  },
  {
    name: "Axie infinity (Axies)",
    percentage: "10%",
    value: "$1.525",
    color: "#ff8e01",
  },
  {
    name: "Other",
    percentage: "10%",
    value: "$1.525",
    color: "#ff9e01",
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
    <section className="wrapper-section">
      {/* Section Header */}
      <header className="wrapper-header">
        <h2 className="wrapper-title">
          Digital Asset Performance / Investment Performance
        </h2>
      </header>

      {/* Performance Metrics */}
      <div className="metrics-container">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardContent className="metric-content">
              <div className="metric-title-wrapper">
                <div className="metric-title">{metric.title}</div>
              </div>

              <div className="metric-details">
                <div className="metric-value">{metric.value}</div>

                <div className="metric-change">
                  <img className="change-icon" alt="Frame" src="/frame-1.svg" />
                  <div className="change-text">{metric.change}</div>
                </div>
              </div>
            </CardContent>

            <img
              className={`metric-chart ${metric.chartWidth} ${metric.chartHeight}`}
              alt="Grafik"
              src={metric.chartSrc}
            />
          </Card>
        ))}
      </div>

      {/* Two Card Row */}
      <div className="two-card-row">
        {/* Portfolio Allocation */}
        <Card className="portfolio-allocation-card">
          <CardContent className="allocation-content">
            <div className="allocation-header">
              <h3 className="allocation-title">Portfolio Application</h3>

              <Badge className="allocation-badge">
                <div className="badge-content">
                  <span className="badge-text">Realized</span>
                  <img className="badge-icon" alt="Frame" src="/frame.svg" />
                </div>
              </Badge>
            </div>

            <div className="allocation-total">Total $150,000</div>

            <div className="donut-wrapper">
              <div className="donut-container">
                <img
                  className="donut-slice-1"
                  alt="Ellipse"
                  src="/ellipse-64.svg"
                />
                <img
                  className="donut-slice-2"
                  alt="Ellipse"
                  src="/ellipse-66.svg"
                />
              </div>
            </div>

            <div className="allocation-legend">
              {portfolioAllocationData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-info">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="legend-label">{item.label}</div>
                  </div>

                  <div className="legend-value">
                    {item.percentage} {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Balance */}
        <Card className="token-balance-wrapper-card">
          <CardContent className="token-balance-wrapper-content">
            <div className="token-balance-wrapper-header">
              <h3 className="token-balance-wrapper-title">Token Balance</h3>
            </div>

            <div className="token-balance-wrapper-body">
             <div className="donut-chart" style={{ position: "relative", width: 160, height: 160 }}>
             
               <PieChart width={160} height={160}>
                 <Pie
                   data={[{ value: 100 }]} 
                   dataKey="value"
                   cx={80}
                   cy={60}                 
                   innerRadius={55}
                   outerRadius={65}
                   startAngle={90}
                   endAngle={450}
                   stroke="none"
                 >
                   <Cell fill="#ef6b23" />
                 </Pie>
               </PieChart>
             
               {/* Center label — manually aligned to match cy={65} */}
               <div
                 style={{
                   position: "absolute",
                   top: 0,
                   left: 0,
                   width: 160,
                   height: 130,              
                   display: "flex",
                   flexDirection: "column",
                   alignItems: "center",
                   justifyContent: "center",
                   pointerEvents: "none",
                 }}
               >
                 <span className="donut-label">Total</span>
                 <span className="donut-value">$15.250</span>
               </div>
             
             </div>

              <img
                className="token-divider"
                alt="Vector"
                src="/vector-2.svg"
              />

              <div className="token-balance-list">
                {tokenBalanceData.map((token, index) => (
                  <div key={index} className="token-balance-item">
                    <div className="token-balance-info">
                      <div
                        className="token-balance-color"
                        style={{ backgroundColor: token.color }}
                      />
                      <div className="token-balance-name">{token.name} :</div>
                      <div className="token-balance-percentage">
                        {token.percentage}
                      </div>
                    </div>
                    <div className="token-balance-value">{token.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Card className="portfolio-table-card">
        <CardContent className="portfolio-table-content">
          <div className="portfolio-table-header">
            <h3 className="portfolio-table-title">Portfolio Application</h3>
          </div>

          <div className="portfolio-table-wrapper">
            <div className="table-header-row">
              <div className="table-header-cell">
                <div className="table-header-text">Asset</div>
              </div>
              <div className="table-header-cell">
                <div className="table-header-text">Purchase Price</div>
              </div>
              <div className="table-header-cell">
                <div className="table-header-text">Current Price</div>
              </div>
              <div className="table-header-cell">
                <div className="table-header-text">ROI (%)</div>
              </div>
              <div className="table-header-cell">
                <div className="table-header-text">24 Hour Change</div>
              </div>
            </div>

            {portfolioTableData.map((row, index) => (
              <div key={index} className="table-data-row">
                <div className="table-data-cell">
                  <div className="table-cell-content">
                    <div className="table-cell-text">{row.asset}</div>
                  </div>
                </div>

                <div className="table-data-cell">
                  <div className="table-cell-content">
                    <div className="table-cell-text">
                      {row.purchasePrice}
                    </div>
                  </div>
                </div>

                <div className="table-data-cell">
                  <div className="table-cell-content-center">
                    <div className="table-cell-text-center">
                      {row.currentPrice}
                    </div>
                  </div>
                </div>

                <div className="table-data-cell">
                  <div className="table-cell-content">
                    <div className="table-cell-text">{row.roi}</div>
                  </div>
                </div>

                <div className="table-data-cell">
                  <div className="table-cell-content">
                    <div className="table-cell-text">{row.change24h}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Plant */}
      <div className="future-plant-wrapper">
        <Card className="future-plant-card">
          <CardContent className="future-plant-content">
            <div className="future-plant-header">
              <h3 className="future-plant-title">Estimated Future Plant</h3>

              <div className="future-plant-controls">
                <img
                  className="filter-icon"
                  alt="Icon filter"
                  src="/icon-filter-1.svg"
                />

                <Badge className="date-badge">
                  <img className="date-icon" alt="Frame" src="/frame-6.svg" />
                  <div className="date-content">
                    <div className="date-text">11 Nov - 11 Dec, 2026</div>
                    <ChevronDownIcon className="date-chevron" />
                  </div>
                </Badge>
              </div>
            </div>

            <div className="future-plant-body">
              {futurePlantData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="future-section">
                  <div className="future-category">{section.category}</div>

                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="future-item-wrapper">
                      <div
                        className={`future-item ${
                          sectionIndex === 1 && itemIndex === 1
                            ? "border-white"
                            : ""
                        }`}
                      >
                        <div className="future-item-content">
                          <div className="future-item-title">
                            {item.title}
                          </div>
                          <div className="future-item-description">
                            {item.description}
                          </div>
                        </div>

                        <div className="future-item-time-wrapper">
                          <div className="future-item-time">{item.time}</div>
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
