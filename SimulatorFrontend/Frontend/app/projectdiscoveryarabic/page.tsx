'use client';
import React from 'react';
import { 
  Bell, HelpCircle, Settings, ArrowLeft, ChevronDown, 
  MapPin, Search, Home 
} from 'lucide-react';
import Image from 'next/image';


// --- Reusable Component: Project Card ---
const ProjectCard = ({ data, isFeatured = false }: { data: any, isFeatured?: boolean }) => {
  return (
    <div className={`rounded-2xl overflow-hidden backdrop-blur-[10px] hover:scale-[1.02] transition-transform duration-300 ${isFeatured ? 'h-full' : ''}`}
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)'
      }}
    >
      
      {/* Card Header with glassmorphism */}
      <div className="p-4 pb-3 rounded-t-2xl backdrop-blur-[10px]" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-white font-bold text-lg md:text-xl flex items-center gap-2" style={{ fontFamily: 'Dubai, sans-serif' }}>
              مشروع الإسكان <Home size={20} className="text-white"/>
            </h3>
            <p className="text-white text-sm md:text-base flex items-center gap-1 mt-1" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 500 }}>
              <MapPin size={16} /> {data.location}
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg flex items-center gap-1.5 text-sm font-medium" style={{ 
            background: 'rgba(254, 249, 191, 0.8)', 
            color: '#231F1F',
            fontFamily: 'Satoshi, sans-serif'
          }}>
            🕒 التخطيط
          </span>
        </div>


        {/* Tags */}
        <div className="flex gap-2 text-xs md:text-sm">
          {['بيئي', 'عالي العائد', 'رمزي'].map(tag => (
            <span key={tag} className="px-3 py-1.5 rounded-full text-white backdrop-blur-[5px]" style={{
              background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
              fontFamily: 'Satoshi, sans-serif'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>


      {/* Image Section */}
      <div className="w-full h-48 md:h-60 relative">
        <Image 
          src="/building.png"
          alt="مبنى المشروع"
          fill
          className="object-cover"
        />
      </div>


      {/* Metrics Section */}
      <div className="p-4 space-y-4">
        
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-white mb-2" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            <span>تقدم التمويل</span>
            <span className="font-medium">2,000$</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden relative" style={{ background: 'rgba(242, 242, 242, 0.8)' }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-300" 
              style={{ width: '33%', background: '#EF6B23' }}
            />
          </div>
        </div>


        {/* Stats Grid */}
        <div className="space-y-2.5 text-sm md:text-base" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          <div className="flex justify-between">
            <span className="text-white/80">الحد الأدنى للاستثمار</span>
            <span className="text-white font-medium">5,000$</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/80">تم التمويل</span>
            <span className="text-white font-medium">20% + 30 يوم متبقي</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/80">القيمة الحالية</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              6,200$ <span className="text-[#13AE85] text-xs font-semibold">+24%</span>
            </span>
          </div>
        </div>


        {/* Graph Visualization */}
        <div className="h-16 w-full relative mt-4">
          <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#13AE85" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#13AE85" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path 
              d="M0 45 Q20 35, 40 38 T80 32 T120 36 T160 28 T200 32 T240 25 T280 30 L300 30 L300 60 L0 60 Z" 
              fill="url(#graphGradient)"
            />
            <path 
              d="M0 45 Q20 35, 40 38 T80 32 T120 36 T160 28 T200 32 T240 25 T280 30 L300 30" 
              fill="none"
              stroke="#13AE85"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>


      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3 p-4 pt-0">
        <button className="py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium text-white transition-all hover:bg-white/20" 
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid #FFFFFF',
            fontFamily: 'Satoshi, sans-serif'
          }}
        >
          عرض التفاصيل
        </button>
        <button className="py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium text-white transition-all hover:opacity-90 shadow-lg" 
          style={{
            background: '#EF6B23',
            fontFamily: 'Satoshi, sans-serif'
          }}
        >
          استثمر الآن
        </button>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function ProjectDiscovery() {
  const projects = Array(6).fill({
    title: "مشروع الإسكان",
    location: "دبي - شوتبانك (سكني)",
    status: "التخطيط",
  });


  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6" style={{ backdropFilter: 'blur(10px)' }}>
      
      {/* 1. Header Section with glassmorphism */}
     <header
        className="flex items-center justify-between px-6 md:px-8"
        style={{
          width: '100%',
          maxWidth: 1834,
          height: 95,
          marginInline: 'auto',
          marginBottom: '24px',
          borderRadius: 30,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <div className="flex flex-col justify-start items-start pb-[5px]">
            <img
              src="/co-build-logo-01-1.png"
              alt="شعار CoBuild"
              className="h-[50px] w-[237px]"
            />
          </div>
        </div>


        {/* Center: Menu */}
        <nav className="flex items-center gap-3">
          {/* Active tab */}
          <button
            className="flex items-center justify-center px-4 py-3 rounded-[25px]"
            style={{
              backgroundColor: '#ef6b23',
            }}
          >
            <span
              className="text-white text-[20px]"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              لوحة المستثمر
            </span>
          </button>


          <button
            className="flex items-center justify-center px-4 py-3 rounded-[25px]"
            style={{
              backgroundColor: '#ef6b23',
            }}
          >
            <span
              className="text-white text-[20px]"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              المحفظة
            </span>
          </button>


          <button
            className="flex items-center justify-center px-4 py-3 rounded-[25px]"
            style={{
              backgroundColor: '#000000',
            }}
          >
            <span
              className="text-white text-[20px]"
              style={{ fontFamily: 'Dubai, sans-serif' }}
            >
              المجتمع
            </span>
          </button>
        </nav>


        {/* Right: Icon buttons */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center rounded-[25px]"
            style={{
              padding: 15,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '0px solid transparent',
            }}
          >
            <Bell size={18} className="text-white" />
          </button>


          <button
            className="flex items-center justify-center rounded-[25px]"
            style={{
              padding: 15,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '0px solid transparent',
            }}
          >
            <HelpCircle size={18} className="text-white" />
          </button>


          <button
            className="flex items-center justify-center rounded-[25px]"
            style={{
              padding: 15,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '0px solid transparent',
            }}
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
      </header>



      {/* 2. Controls & Filters Bar */}
     <div className="flex items-center gap-3 px-6 py-4">
  {/* Back Button */}
  <button 
    className="flex items-center justify-center w-[46px] h-[46px] rounded-full transition-all hover:opacity-90"
    style={{
      background: '#ef6b23'
    }}
  >
    <ArrowLeft size={20} className="text-white" />
  </button>


  {/* Title */}
  <h1 
    className="text-white text-[24px] font-medium mr-4"
    style={{ fontFamily: 'Dubai, sans-serif' }}
  >
    اكتشاف المشاريع
  </h1>


  {/* Filter Pills Container */}
  <div className="flex items-center gap-3 flex-1">
    {/* Map Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      الخريطة
      <ChevronDown size={14} />
    </button>


    {/* Search Input */}
    <div className="relative">
      <Search 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" 
        size={16} 
      />
      <input 
        type="text"
        placeholder="بحث"
        className="w-[200px] pl-11 pr-4 py-2.5 rounded-full text-white text-[14px] placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
        style={{
          background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
          fontFamily: 'Dubai, sans-serif'
        }}
      />
    </div>


    {/* Sort Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      الترتيب
      <ChevronDown size={14} />
    </button>


    {/* Location Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      الموقع
      <ChevronDown size={14} />
    </button>


    {/* Project Status Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      حالة المشروع
      <ChevronDown size={14} />
    </button>


    {/* Investment Type Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      نوع الاستثمار
      <ChevronDown size={14} />
    </button>


    {/* Duration Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      المدة
      <ChevronDown size={14} />
    </button>


    {/* Founding Progress Button */}
    <button 
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[14px] whitespace-nowrap hover:bg-white/10 transition"
      style={{
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), linear-gradient(134.61deg, rgba(255, 255, 255, 0.3) -29.34%, rgba(255, 255, 255, 0.05) 131.55%)',
        fontFamily: 'Dubai, sans-serif'
      }}
    >
      تقدم التمويل
      <ChevronDown size={14} />
    </button>
  </div>
</div>



      {/* 3. Main Layout Grid */}
     <div className="p-6 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2">
            {['إسكان ميسور', 'فاخر', 'طاقة خضراء', 'مدعوم من المجتمع'].map(tag => (
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


          {/* Featured Project Section */}
          <div className="p-5 rounded-2xl backdrop-blur-[20px]" style={{
            background: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h2 className="text-base font-semibold mb-4 text-white" style={{ fontFamily: 'Dubai, sans-serif' }}>
              المشروع المميز
            </h2>
            <ProjectCard data={projects[0]} isFeatured={true} />
          </div>
        </div>


        {/* Right Content Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project, idx) => (
            <ProjectCard key={idx} data={project} />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
