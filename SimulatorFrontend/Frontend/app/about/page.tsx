"use client";

import * as React from "react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function AboutPage() {
  const [isWhiteTheme, setIsWhiteTheme] = React.useState(false);

  return (
    <div 
      className={`overflow-x-hidden w-full min-h-screen relative transition-colors duration-700 ease-in-out ${
        isWhiteTheme ? 'bg-white' : 'bg-black'
      }`}
    >
      {/* Header */}
      <header className="flex w-full max-w-[1363px] mx-auto items-center justify-between px-4 sm:px-6 md:px-10 py-6 md:py-[54px] relative z-10">
        <div className="flex flex-col w-[150px] sm:w-[200px] md:w-[291px] items-start">
          <img
            className="relative w-full h-auto object-contain transition-all duration-700 cursor-pointer"
            alt="Co build logo"
            src="/co-build-logo-01-1.png"
            onClick={() => window.location.href = '/'}
            style={{
              filter: isWhiteTheme ? 'invert(1) brightness(0)' : 'invert(0)',
            }}
          />
        </div>

        <button 
          onClick={() => setIsWhiteTheme(!isWhiteTheme)}
          className="w-auto sm:w-[137px] h-[40px] sm:h-[52px] gap-2 px-4 sm:px-8 py-1.5 bg-[#ef6b23] rounded-[15px] overflow-hidden hover:bg-[#ef6b23]/90 text-white text-sm sm:text-lg font-semibold [font-family:'Manrope',Helvetica] cursor-pointer"
        >
          Toggle Theme
        </button>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-[1363px] mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-24">
        <h1 className={`[font-family:'Satoshi-Bold',Helvetica] font-bold text-4xl sm:text-5xl md:text-6xl leading-tight transition-colors duration-700 mb-8 ${
          isWhiteTheme ? 'text-black' : 'text-white'
        }`}>
          About Co Build
        </h1>

        <div className={`text-lg md:text-xl leading-relaxed transition-colors duration-700 space-y-6 ${
          isWhiteTheme ? 'text-gray-700' : 'text-gray-300'
        }`}>
          <p>
            Welcome to Co Build - where real estate investment meets blockchain innovation.
          </p>
          <p>
            Our mission is to democratize real estate investments through tokenization, making property ownership accessible to everyone.
          </p>
          <p>
            We believe in the future of decentralized finance and are committed to building transparent, secure, and user-friendly solutions for real estate investors.
          </p>
        </div>

        <button 
          onClick={() => window.location.href = '/'}
          className="mt-12 w-auto px-8 h-[52px] bg-[#ef6b23] rounded-[15px] overflow-hidden hover:bg-[#ef6b23]/90 text-white text-lg font-semibold cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}