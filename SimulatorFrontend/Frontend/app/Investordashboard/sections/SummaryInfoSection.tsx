import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/button";
import { Card, CardContent } from "../../components/card";
import "./SummaryInfoSection.css";

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
    color: "#ef6b23",
    label: "Bored Ape Yacht Club",
    percentage: "40%",
    value: "$6.100",
  },
  {
    color: "#ff6e03",
    label: "CryptoPunks",
    percentage: "25%",
    value: "$3.100",
  },
  {
    color: "#ff7d01",
    label: "Decentraland (Land)",
    percentage: "15%",
    value: "$2.287",
  },
  {
    color: "#ff8e01",
    label: "Axie infinity (Axies)",
    percentage: "10%",
    value: "$1.525",
  },
  {
    color: "#ff9e01",
    label: "Other",
    percentage: "10%",
    value: "$1.525",
  },
];

export const SummaryInfoSection = (): React.ReactElement => {
  return (
    <section className="summary-section">
      <header className="summary-header">
        <h1 className="header-title">Total Invested</h1>

        <div className="wallet-info-container">
          <div className="wallet-info-left">
            <span className="wallet-label">Fiat Wallet</span>
            <span className="wallet-colon">:</span>
            <span className="wallet-value">$9,385.34</span>
          </div>

          <div className="wallet-info-right">
            <span className="wallet-label">Token Value</span>
            <span className="wallet-colon">:</span>
            <span className="wallet-value">$2,578.32</span>
          </div>
        </div>
      </header>

      <div className="content-wrapper">
        <Card className="nft-chart-card">
          <CardContent className="card-content">
            <div className="card-header">
              <h2 className="card-title">NFT</h2>
              <Button variant="ghost" className="filter-button">
                <div className="button-content">
                  <span className="button-text">Realized</span>
                  <ChevronDownIcon className="chevron-icon" />
                </div>
              </Button>
            </div>

            <div className="chart-container">
              <div className="months-container">
                {monthsData.map((month, index) => (
                  <button
                    key={index}
                    className={`month-button ${month.active ? "active" : ""}`}
                  >
                    <span>{month.label}</span>
                  </button>
                ))}
              </div>

              <img className="graphic-1" alt="Graphic" src="/graphic.svg" />
              <img className="graphic-2" alt="Graphic" src="/graphic-1.svg" />
              <img className="line" alt="Line" src="/line.svg" />

              <div className="chart-tooltip">
                <img
                  className="tooltip-bg"
                  alt="Background"
                  src="/background.svg"
                />
                <span className="tooltip-text">$4,892</span>
              </div>

              <div className="chart-dot" />
            </div>

            <div className="chart-summary">
              <span className="summary-value">$34,742.00</span>
              <span className="summary-description">
                This is $54.00 less than last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="cards-row">
        <Card className="nft-performance-card">
          <CardContent className="card-content">
            <div className="card-header">
              <h2 className="card-title">NFT</h2>
              <Button variant="ghost" className="filter-button">
                <div className="button-content">
                  <span className="button-text">Monthly</span>
                  <ChevronDownIcon className="chevron-icon" />
                </div>
              </Button>
            </div>

            <div className="performance-list">
              {nftPerformanceData.map((item, index) => (
                <div key={index} className="performance-item">
                  <div className="performance-header">
                    <div className="performance-info">
                      <span className="performance-label">{item.label}</span>
                      <span className="performance-value">{item.value}</span>
                    </div>
                    <span className="performance-percentage">
                      {item.percentage}
                    </span>
                  </div>
                  <img
                    className="performance-chart"
                    alt="Group"
                    src={item.image}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="token-balance-card">
          <CardContent className="card-content">
            <div className="card-header">
              <h2 className="card-title">Token Balance</h2>
            </div>

            <div className="token-content">
              <div className="donut-chart">
                <img
                  className="donut-slice"
                  alt="Ellipse"
                  src="/ellipse-3328.svg"
                />
                <img
                  className="donut-slice"
                  alt="Ellipse"
                  src="/ellipse-3331.svg"
                />
                <img
                  className="donut-slice"
                  alt="Ellipse"
                  src="/ellipse-3330.svg"
                />
                <img
                  className="donut-slice"
                  alt="Ellipse"
                  src="/ellipse-3332.svg"
                />
                <img
                  className="donut-slice donut-slice-5"
                  alt="Ellipse"
                  src="/ellipse-3329.svg"
                />

                <div className="donut-center">
                  <span className="donut-label">Total</span>
                  <span className="donut-value">$15.250</span>
                </div>
              </div>

              <img className="divider" alt="Vector" src="/vector-2.svg" />

              <div className="token-list">
                {tokenBalanceData.map((item, index) => (
                  <div key={index} className="token-item">
                    <div className="token-info">
                      <div
                        className="token-color"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="token-label">{item.label} :</span>
                      <span className="token-percentage">{item.percentage}</span>
                    </div>
                    <span className="token-value">{item.value}</span>
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
