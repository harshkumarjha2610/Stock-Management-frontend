"use client";
import { ReactNode, useState } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  Send, 
  CreditCard, 
  Search, 
  Bell, 
  Settings, 
  Menu,
  X,
  ChevronDown,
  ArrowLeftRight
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Link, useLocation } from "wouter";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data & Assets ---
const imgBitcoin = "/assets/bitcoin.png";
const imgEthereum = "/assets/ethereum.png";
const imgDesign = "/assets/card-design.png";
const imgCoBuildLogo = "/assets/cobuild-logo.png";
const imgSolana = "/assets/solana.png";
const imgUsdc = "/assets/usdc.png";
const imgVector1 = "/assets/vector1.png";
const imgVector2 = "/assets/vector2.png";
const imgVector3 = "/assets/vector3.png";

const MOCK_TRANSACTIONS = [
  { id: 1, date: "2025-01-14", type: "Deposit", amount: "0.2 BTC", status: "Completed", fee: "$5.00", txnId: "TXN123456789" },
  { id: 2, date: "2025-01-12", type: "Withdrawal", amount: "1.0 ETH", status: "Pending", fee: "$10.00", txnId: "TXN987654321" },
  { id: 3, date: "2025-01-11", type: "Transfer", amount: "1,000 ADA", status: "Completed", fee: "$2.00", txnId: "TXN456789123" },
  { id: 4, date: "2025-01-10", type: "Deposit", amount: "0.5 BTC", status: "Completed", fee: "$3.00", txnId: "TXN789123456" },
];

const allocationData = [
  { name: 'Divided', value: 65, color: '#ef6b23' },
  { name: 'Remaining', value: 35, color: 'rgba(255, 255, 255, 0.1)' },
];

const walletsList = [
  { name: "Phantom", date: "15 Mar 2025", icon: "/assets/phantom.png", status: "connected" },
  { name: "MetaMask", date: "16 Mar 2025", icon: "/assets/metamask.png", status: "disconnected" },
  { name: "Stripe", date: "16 Mar 2025", icon: "/assets/stripe.png", status: "disconnected" },
  { name: "Paypal", date: "16 Mar 2025", icon: "/assets/paypal.png", status: "disconnected" }
];

// --- Components ---

function ActionButtons() {
  const actions = [
    { label: "Recharge", icon: ArrowDown },
    { label: "Withdraw", icon: ArrowUp },
    { label: "Send", icon: Send },
    { label: "Cards", icon: CreditCard },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex justify-between items-center w-full gap-1">
      {actions.map((action, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer min-w-[50px]">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#303030] flex items-center justify-center hover:scale-110 transition-all duration-300">
            <action.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="text-[10px] lg:text-xs font-medium text-white whitespace-nowrap">{action.label}</span>
        </div>
      ))}
    </div>
  );
}

function SpendingChart() {
  return (
    <div className="w-full h-5 relative">
      <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#ef6b23] rounded-full transition-all duration-500" style={{ width: '65%' }} />
      </div>
      <div className="absolute left-[65%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-[#ef6b23] shadow-lg flex items-center justify-center">
        <div className="w-0.5 h-2 bg-[#ef6b23] rounded-full" />
      </div>
    </div>
  );
}

function TransactionsTable() {
  return (
    <div className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] h-full flex flex-col overflow-hidden"
         style={{ backgroundImage: "linear-gradient(156deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}>
      <div className="px-4 lg:px-6 py-4 lg:py-5">
        <h3 className="text-sm lg:text-base font-medium text-white">Recent Transactions</h3>
      </div>

      <div className="bg-white/10 h-10 lg:h-12 flex items-center px-4 lg:px-6 shadow-sm">
        <div className="grid grid-cols-6 w-full text-[10px] lg:text-xs font-bold text-white uppercase tracking-wider gap-1">
          <span>Date</span>
          <span>Type</span>
          <span className="text-center">Amount</span>
          <span className="text-center">Status</span>
          <span className="text-center">Fee</span>
          <span className="text-right">ID</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-2">
        {MOCK_TRANSACTIONS.map((txn, i) => (
          <div key={i} className="grid grid-cols-6 w-full py-3 lg:py-4 border-b border-white/10 items-center last:border-0 gap-1 text-[11px] lg:text-xs">
            <span className="font-bold text-[#ececec]">{txn.date}</span>
            <span className="font-bold text-[#ececec]">{txn.type}</span>
            <span className="font-bold text-[#ececec] text-center">{txn.amount}</span>
            <div className="flex justify-center">
              <div className={cn(
                "px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium min-w-[60px] lg:min-w-[80px] text-center",
                txn.status === 'Completed' ? "bg-[#1edf8d]/30 text-[#30e498]" : "bg-[#fcb45e]/30 text-[#fcb45e]"
              )}>
                {txn.status}
              </div>
            </div>
            <span className="font-bold text-[#ececec] text-center">{txn.fee}</span>
            <span className="font-bold text-[#ececec] text-right truncate text-[10px]">{txn.txnId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletConnect() {
  const [connected, setConnected] = useState<string[]>(["Phantom"]);

  return (
    <div className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col"
         style={{ backgroundImage: "linear-gradient(133deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}>
      <h3 className="text-sm lg:text-base font-medium text-white mb-3 lg:mb-4">Connect Wallet</h3>
      
      <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto">
        {walletsList.map((wallet, i) => {
          const isConnected = connected.includes(wallet.name);
          return (
            <div key={wallet.name} className="flex flex-col gap-2 lg:gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-black overflow-hidden flex items-center justify-center border border-white/10">
                    <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 lg:w-6 lg:h-6 object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-xs lg:text-sm font-medium leading-tight">{wallet.name}</span>
                    <span className="text-[#fcfcfc] text-[10px] lg:text-xs font-light leading-tight">{wallet.date}</span>
                  </div>
                </div>
                
                <button className="h-6 lg:h-7 px-2 lg:px-3 rounded-full border border-white/80 flex items-center gap-1 text-white text-[10px] lg:text-xs font-medium hover:bg-white/10 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  Connect
                </button>
              </div>
              {i < walletsList.length - 1 && (
                <div className="h-px bg-white/10 w-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SwapInterface() {
  return (
    <div className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col relative"
         style={{ backgroundImage: "linear-gradient(138deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}>
      
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-sm lg:text-base font-medium text-white">Swap Tokens</h3>
        <span className="text-[10px] lg:text-xs font-medium text-white cursor-pointer opacity-80 hover:opacity-100">Slippage</span>
      </div>

      <div className="space-y-2 lg:space-y-3 relative flex-1">
        {/* Pay Section */}
        <div className="border border-white/20 rounded-[12px] lg:rounded-[15px] p-3 lg:p-4 h-auto lg:h-[80px] relative overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[#ececec] text-[10px] lg:text-xs font-medium mb-1">You Pay</p>
              <p className="text-white text-sm lg:text-base font-medium">3.000</p>
            </div>
            <div className="flex items-center gap-1.5">
              <img src={imgSolana} alt="SOL" className="w-7 h-7 lg:w-10 lg:h-10" />
              <div className="flex items-center gap-0.5 text-white text-xs lg:text-sm font-medium cursor-pointer whitespace-nowrap">
                SOL <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-white/20 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all rotate-90 shadow-xl">
            <ArrowLeftRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
          </div>
        </div>

        {/* Receive Section */}
        <div className="border border-white/20 rounded-[12px] lg:rounded-[15px] p-3 lg:p-4 h-auto lg:h-[80px] relative overflow-hidden mt-5 lg:mt-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-[#ececec] text-[10px] lg:text-xs font-medium mb-1">You Receive</p>
              <p className="text-white text-sm lg:text-base font-medium">3.000</p>
            </div>
            <div className="flex items-center gap-1.5 relative">
              <img src={imgUsdc} alt="USDC" className="w-16 h-16 lg:w-24 lg:h-24 absolute -right-3 -top-3 lg:-right-4 lg:-top-4 opacity-80" />
              <div className="flex items-center gap-0.5 text-white text-xs lg:text-sm font-medium cursor-pointer relative z-10 mr-1 whitespace-nowrap">
                USDC <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-6">
        <button className="w-full h-8 lg:h-9 bg-[#ef6b23] rounded-full text-white font-medium text-xs lg:text-sm hover:bg-[#ef6b23]/90 transition-all">
          Swap Coin
        </button>
      </div>
    </div>
  );
}

function AllocationChart() {
  return (
    <div className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full relative overflow-hidden" 
         style={{ backgroundImage: "linear-gradient(133deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}>
      <h3 className="text-sm lg:text-base font-medium text-white mb-2">Allocation Funds</h3>
      
      <div className="relative w-full h-[150px] lg:h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocationData}
              innerRadius={45}
              outerRadius={60}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-[#ef6b23] px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase mb-1">
            Funds
          </div>
          <div className="text-xl lg:text-2xl font-bold text-white">$35,450</div>
          <div className="text-white/60 text-[10px] lg:text-xs">Divided Wallet</div>
        </div>
      </div>

      <div className="absolute bottom-4 lg:bottom-5 left-0 w-full px-4 lg:px-6">
        <div className="h-px bg-white/20 w-full mb-2 lg:mb-3" />
        <div className="flex justify-between items-center px-1">
          {[
            { label: "Phantom", color: "bg-white" },
            { label: "Connects", color: "bg-white" },
            { label: "Coinbase", color: "bg-white" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="text-[10px] lg:text-xs text-white font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletCard() {
  return (
    <div className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] p-4 lg:p-5 h-full flex flex-col"
         style={{ backgroundImage: "linear-gradient(134deg, rgba(255, 255, 255, 0.3) 29%, rgba(255, 255, 255, 0.05) 131%)" }}>
      <h3 className="text-sm lg:text-base font-medium text-white mb-3 lg:mb-4">My Card Wallet</h3>
      
      <div className="relative w-full h-[130px] lg:h-[160px] rounded-[15px] lg:rounded-[20px] overflow-hidden bg-[#19224d]">
        <div className="absolute inset-0 opacity-50">
           <img src={imgVector1} className="absolute top-0 right-0 w-2/3 h-full object-cover" />
           <img src={imgVector2} className="absolute bottom-0 right-0 w-1/2 h-2/3 object-contain" />
           <img src={imgVector3} className="absolute top-0 left-0 w-1/2 h-full object-contain" />
        </div>

        <div className="relative z-10 p-4 lg:p-5 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#ef6b23]" />
              </div>
              <span className="font-semibold text-xs lg:text-sm text-white">Coinbuzz</span>
            </div>
            <span className="font-bold text-lg lg:text-xl text-white">$23,567.45</span>
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-white text-xs tracking-widest">**** **** **** 9865</p>
              <div className="flex items-center gap-1.5">
                <div className="text-[4px] lg:text-[5px] text-white leading-none uppercase">VALID<br/>THRU</div>
                <span className="text-white text-[10px] lg:text-xs">08/25</span>
              </div>
            </div>
            <div className="text-white font-bold italic text-base lg:text-lg">VIZA</div>
          </div>
        </div>
      </div>

      <button className="mt-auto w-full h-8 rounded-full border border-white/60 bg-transparent text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition-all">
        <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-white text-black flex items-center justify-center text-xs">+</div>
        Add Card
      </button>
    </div>
  );
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Wallet", href: "/wallet" },
    { label: "Community", href: "/community" },
  ];

  return (
    <div className="min-h-screen bg-black text-foreground font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ef6b23]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2c3a7c]/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-3 lg:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] lg:w-[calc(100%-24px)] max-w-[1866px] z-50">
        <nav className="backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[25px] h-14 lg:h-16 px-3 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={imgCoBuildLogo} alt="CoBuild" className="h-8 lg:h-10 w-auto" />
          </div>

          {/* Desktop Navigation - Shows at 1024px and up */}
          <div className="hidden lg:flex items-center gap-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "px-4 py-2 rounded-[20px] flex items-center gap-2 transition-all duration-300 cursor-pointer h-10",
                    isActive 
                      ? "bg-[#ef6b23] text-white" 
                      : "text-white/80 hover:text-white"
                  )}>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {[Bell, Search, Settings].map((Icon, i) => (
                <button 
                  key={i}
                  className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden w-9 h-9 flex items-center justify-center text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] p-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "px-4 py-2.5 rounded-[12px] flex items-center gap-2 transition-all duration-300 cursor-pointer mb-2",
                      isActive 
                        ? "bg-[#ef6b23] text-white" 
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            <div className="flex items-center justify-around pt-2 border-t border-white/10">
              {[Bell, Search, Settings].map((Icon, i) => (
                <button 
                  key={i}
                  className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-20 lg:pt-24 pb-4 lg:pb-8 px-3 lg:px-6 max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
}

// --- Main Wallet Page ---

export default function Wallet() {
  return (
    <DashboardLayout>
      {/* 
        Layout uses CSS Grid for precise column alignment
        Left sidebar: fixed width
        Right area: 3 equal columns where AllocationChart and WalletCard share the same column width
      */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 w-full">
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[380px] shrink-0 backdrop-blur-[20px] bg-white/10 border border-white/20 rounded-[15px] lg:rounded-[20px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-[70px] lg:h-[80px] border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-white/80 text-sm lg:text-base font-medium">Total Invested</span>
              <span className="text-white/80 text-sm lg:text-base">:</span>
              <span className="text-white text-xl lg:text-2xl font-bold ml-1">$9,385.34</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
              <Search className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <ActionButtons />

            <div className="backdrop-blur-[20px] bg-white/5 border border-white/10 rounded-[15px] p-4">
              <p className="text-white/80 text-xs mb-3">Spending in November</p>
              <SpendingChart />
              <div className="flex flex-col gap-1 mt-3">
                <span className="text-white text-lg font-bold">$274.00</span>
                <span className="text-white/60 text-[10px]">This is $54.00 less than last month</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { ticker: "BTC", amount: "0.00040", usd: "$3,000", icon: imgBitcoin },
                { ticker: "ETH", amount: "0.00095", usd: "$3,000", icon: imgEthereum }
              ].map((asset, i) => (
                <div key={i} className="bg-[#303030] rounded-[12px] h-[55px] flex items-center px-4 justify-between">
                  <div className="flex items-center gap-2">
                    <img src={asset.icon} className="w-7 h-7 rounded-full" alt={asset.ticker} />
                    <span className="text-white font-medium text-sm">{asset.ticker}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium text-sm">{asset.amount}</div>
                    <div className="text-white/40 text-xs">({asset.usd})</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative h-[140px] w-full rounded-[15px] overflow-hidden">
              <img src={imgDesign} alt="Design" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="text-right text-white text-lg font-medium">$9,385.34</div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-white text-xs tracking-widest">**** **** **** 9865</div>
                    <div className="flex items-center gap-1">
                      <div className="text-[4px] text-white/60 leading-none">VALID<br/>THRU</div>
                      <div className="text-white text-[10px]">08/25</div>
                    </div>
                  </div>
                  <div className="text-white font-bold italic text-lg">VIZA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CSS Grid for consistent column widths */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 min-w-0 content-start">
          {/* Row 1: AllocationChart | WalletConnect | SwapInterface */}
          <div className="h-[260px] lg:h-[320px]">
            <AllocationChart />
          </div>
          <div className="h-[280px] lg:h-[320px]">
            <WalletConnect />
          </div>
          <div className="h-[280px] lg:h-[320px]">
            <SwapInterface />
          </div>

          {/* Row 2: WalletCard (same column as AllocationChart) | TransactionsTable (spans 2 columns) */}
          <div className="h-[260px] lg:h-[320px]">
            <WalletCard />
          </div>
          <div className="h-[300px] lg:h-[320px] lg:col-span-2">
            <TransactionsTable />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}