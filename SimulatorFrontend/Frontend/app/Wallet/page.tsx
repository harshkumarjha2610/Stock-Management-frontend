"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  const [spendingAmount] = useState(274.0);
  const [spendingLimit] = useState(850.0);
  const spendingPercentage = (spendingAmount / spendingLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-2 border-blue-500 p-6">
        {/* Total Invested Header */}
        <div className="bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Total Invested</span>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-bold">$9,385.34</span>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mb-6">
          <ActionButton icon="↓" label="Recharge" />
          <ActionButton icon="↑" label="Withdraw" />
          <ActionButton icon="→" label="Send" />
          <ActionButton icon="🎴" label="Cards" />
          <ActionButton icon="⚙" label="Settings" />
        </div>

        {/* Spending Progress Card */}
        <div className="bg-gray-700/50 rounded-xl p-5 mb-6 border border-gray-600">
          <h3 className="text-gray-300 text-sm mb-3">Spending in November</h3>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-gray-600 rounded-full overflow-hidden mb-3">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300"
              style={{ width: `${spendingPercentage}%` }}
            />
          </div>

          {/* Amount and Description */}
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xl font-bold">
              ${spendingAmount.toFixed(2)}
            </span>
            <span className="text-gray-400 text-xs">
              This is $400 less than last month
            </span>
          </div>
        </div>

        {/* Cryptocurrency Holdings */}
        <div className="space-y-3 mb-6">
          <CryptoItem
            icon="🔵"
            name="Bitcoin"
            amount="0.00040"
            value="$3000"
            bgColor="bg-blue-600"
          />
          <CryptoItem
            icon="🟡"
            name="Ethereum"
            amount="0.000095"
            value="$3000"
            bgColor="bg-yellow-500"
          />
        </div>

        {/* Total Balance */}
        <div className="flex justify-end mb-6">
          <span className="text-white text-2xl font-bold">$9,385.34</span>
        </div>

        {/* Card Details */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-5 border border-gray-600">
          <div className="flex justify-between items-start mb-8">
            <div className="text-gray-400 text-sm">
              <span className="tracking-wider">•••• •••• ••••</span>{" "}
              <span className="text-white font-semibold">8865</span>
            </div>
            <div className="text-white font-bold text-xl">VISA</div>
          </div>
          <div className="text-gray-400 text-xs">
            <span className="text-white">EXP</span> 04/28
          </div>
        </div>
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-600 group-hover:border-blue-500">
        <span className="text-lg">{icon}</span>
      </div>
      <span className="text-gray-400 text-xs group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

// Crypto Item Component
function CryptoItem({
  icon,
  name,
  amount,
  value,
  bgColor,
}: {
  icon: string;
  name: string;
  amount: string;
  value: string;
  bgColor: string;
}) {
  return (
    <div className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-xl`}
        >
          {icon}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{amount}</p>
          <p className="text-gray-400 text-xs">{name}</p>
        </div>
      </div>
      <span className="text-gray-300 text-sm">{value}</span>
    </div>
  );
}
