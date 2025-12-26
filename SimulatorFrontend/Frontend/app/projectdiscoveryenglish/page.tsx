'use client';
import React, { useState } from 'react';
import { 
  ArrowLeft, ChevronDown, MapPin, Search, Home, Filter
} from 'lucide-react';
import Image from 'next/image';
import { HeaderSection } from '@/app/Investordashboard/sections/HeaderSection';
import { useRouter } from 'next/navigation';


// --- TypeScript Interfaces ---
interface ProjectData {
  title: string;
  location: string;
  status: string;
}


interface ProjectCardProps {
  data: ProjectData;
  isFeatured?: boolean;
}


// --- Reusable Component: Project Card ---
const ProjectCard = ({ data, isFeatured = false }: ProjectCardProps) => {
  const router = useRouter();


  return (
    <div 
      className="rounded-2xl overflow-hidden backdrop-blur-[10px] hover:scale-[1.02] transition-transform duration-300"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)'
      }}
    >
      {/* Card Header - WITHOUT tags */}
      <div className="p-2.5 sm:p-3 md:p-3.5 pb-2 sm:pb-2.5 rounded-t-2xl backdrop-blur-[10px]" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base md:text-lg flex items-center gap-1.5" style={{ fontFamily: 'Dubai, sans-serif' }}>
              {data.title} <Home size={14} className="text-white sm:w-4 sm:h-4"/>
            </h3>
            <p className="text-white text-[10px] sm:text-xs md:text-sm flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
              <MapPin size={11} className="sm:w-3 sm:h-3" /> {data.location}
            </p>
          </div>
          <span className="px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs font-medium whitespace-nowrap" style={{ 
            background: 'rgba(254, 249, 191, 0.8)', 
            color: '#231F1F',
            fontFamily: 'Satoshi, sans-serif'
          }}>
            🕒 {data.status}
          </span>
        </div>
      </div>


      {/* Tags and Image Section */}
      <div className="px-2 sm:px-2.5 md:px-3 py-2 sm:py-2.5">
        {/* Tags ABOVE the image */}
        <div className="flex gap-1 sm:gap-1.5 mb-2 text-[9px] sm:text-[10px]">
          {['Eco', 'High-Yield', 'Tokenized'].map(tag => (
            <span key={tag} className="px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full text-white backdrop-blur-[5px]" style={{
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
              fontFamily: 'Satoshi, sans-serif'
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Image - Clean, no overlay */}
        <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 relative rounded-xl overflow-hidden">
          <Image 
            src="/building.png"
            alt="Project Building"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isFeatured}
          />
        </div>
      </div>


      {/* Metrics Section - Slightly increased spacing */}
      <div className="p-2.5 sm:p-3 md:p-3.5 space-y-2 sm:space-y-2.5 md:space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs text-white mb-1.5 sm:mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            <span>Founding Progress</span>
            <span className="font-medium">$2,000</span>
          </div>
          <div className="w-full h-1 sm:h-1.5 rounded-full overflow-hidden relative" style={{ background: 'rgba(242, 242, 242, 0.8)' }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-300" 
              style={{ width: '33%', background: '#EF6B23' }}
            />
          </div>
        </div>


        {/* Stats Grid - Slightly increased spacing */}
        <div className="space-y-1.5 sm:space-y-2 text-[9px] sm:text-[10px] md:text-xs" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          <div className="flex justify-between">
            <span className="text-white/80">Minimal Investment</span>
            <span className="text-white font-medium">$5,000</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/80">Founded</span>
            <span className="text-white font-medium">20% + 30 Days Left</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">Current Value</span>
            <span className="text-white font-medium flex items-center gap-1">
              $6,200 <span className="text-[#13AE85] text-[8px] sm:text-[9px] font-semibold">+24%</span>
            </span>
          </div>
        </div>


        {/* Graph Visualization - Green filled graph */}
        <div className="h-12 sm:h-14 md:h-16 lg:h-18 w-full relative mt-2 sm:mt-2.5">
          <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`graphGradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#13AE85" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#13AE85" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {/* Filled area - Green gradient */}
            <path 
              d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35 L300 80 L0 80 Z" 
              fill={`url(#graphGradient-${Math.random()})`}
            />
            {/* Line stroke - Thicker for better visibility */}
            <path 
              d="M0 55 Q20 40, 40 45 T80 38 T120 42 T160 32 T200 38 T240 28 T280 35 L300 35" 
              fill="none"
              stroke="#13AE85"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>


      {/* Buttons - Slightly increased sizing */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 p-2.5 sm:p-3 md:p-3.5 pt-0">
        <button 
          className="py-2 sm:py-2.5 md:py-3 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium text-white transition-all hover:bg-white/20" 
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #FFFFFF',
            fontFamily: 'Satoshi, sans-serif'
          }}
        >
          View Details
        </button>
        <button 
          onClick={() => router.push('/SimulatorDashboardF3')}
          className="py-2 sm:py-2.5 md:py-3 rounded-full text-[9px] sm:text-[10px] md:text-xs font-medium text-white transition-all hover:opacity-90 shadow-lg" 
          style={{
            background: '#EF6B23',
            fontFamily: 'Satoshi, sans-serif'
          }}
        >
          Invest Now
        </button>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function ProjectDiscovery() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();


  const projects: ProjectData[] = Array(6).fill({
    title: "Project Housing",
    location: "Dubai - Shoutbank (Residential)",
    status: "Planning",
  });


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Container - Consistent padding from lg onwards */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 pt-1 pb-4 sm:pt-2 sm:pb-6">
      
        {/* 1. Header Section */}
        <div className="-mt-4 sm:-mt-5 md:-mt-6"> 
          <HeaderSection />
        </div>


        {/* 2. Controls & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 mt-4 sm:mt-6 md:mt-8">
          {/* Back Button & Title Row */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full transition-all hover:opacity-90 flex-shrink-0"
              style={{ background: '#ef6b23' }}
            >
              <ArrowLeft size={18} className="text-white sm:w-5 sm:h-5" />
            </button>


            <h1 
              className="text-white text-[20px] sm:text-[24px] font-medium flex-1"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              Project Discovery
            </h1>


            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm"
              style={{ background: '#ef6b23' }}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>


          {/* Desktop Filters - Same styling for all desktop sizes */}
          <div className="hidden lg:flex items-center gap-2.5 flex-1 overflow-x-auto scrollbar-hide">
            {/* Search Input */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={14} />
              <input 
                type="text"
                placeholder="Search"
                className="w-[160px] pl-9 pr-3 py-2 rounded-full text-white text-[13px] placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
                style={{
                  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
                  fontFamily: 'Dubai, sans-serif'
                }}
              />
            </div>


            {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
              <button 
                key={label}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] whitespace-nowrap hover:bg-white/10 transition flex-shrink-0"
                style={{
                  background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
                  fontFamily: 'Dubai, sans-serif'
                }}
              >
                {label}
                <ChevronDown size={12} />
              </button>
            ))}
          </div>
        </div>


        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div 
            className="lg:hidden mb-4 p-4 rounded-2xl animate-slideDown"
            style={{
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
              <input 
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 rounded-full text-white text-sm placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  fontFamily: 'Dubai, sans-serif'
                }}
              />
            </div>


            <div className="grid grid-cols-2 gap-2">
              {['Map', 'Sort', 'Location', 'Project Status', 'Investment Type', 'Duration', 'Founding Progress'].map((label) => (
                <button 
                  key={label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-sm hover:bg-white/10 transition"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    fontFamily: 'Dubai, sans-serif'
                  }}
                >
                  {label}
                  <ChevronDown size={14} />
                </button>
              ))}
            </div>
          </div>
        )}


        {/* 3. Main Layout Grid - Wider featured project section */}
        <div 
          className="p-3 sm:p-4 md:p-6 rounded-2xl backdrop-blur-md border border-white/20"
          style={{
            maxWidth: 1834,
            marginInline: 'auto',
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6">
            
            {/* Left Sidebar - WIDER Featured Project Section (4 columns) */}
            <div className="hidden lg:block lg:col-span-4 space-y-5 md:space-y-6">
              {/* Quick Tags */}
              <div className="flex flex-wrap gap-2">
                {['Affordable Housing', 'Luxury', 'Green Energy', 'Community-Backed'].map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1.5 rounded-full text-xs text-white cursor-pointer hover:bg-white/20 transition backdrop-blur-[5px]"
                    style={{
                      background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
                      fontFamily: 'Satoshi, sans-serif'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>


              {/* Featured Project - Same size as other cards */}
              <div className="p-4 md:p-5 rounded-2xl backdrop-blur-[20px]" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
                <h2 className="text-base font-semibold mb-4 text-white" style={{ fontFamily: 'Dubai, sans-serif' }}>
                  Featured Project
                </h2>
                <ProjectCard data={projects[0]} isFeatured={true} />
              </div>
            </div>


            {/* Right Content Grid - 8 columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
              {/* First 4 cards - Always visible from lg onwards */}
              {projects.slice(0, 4).map((project, idx) => (
                <ProjectCard key={idx} data={project} />
              ))}
              
              {/* Last 2 cards - Only visible on 2xl+ screens */}
              <div className="hidden 2xl:contents">
                {projects.slice(4, 6).map((project, idx) => (
                  <ProjectCard key={idx + 4} data={project} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Animations */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }


        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;  
        }
      `}</style>
    </div>
  );
}
