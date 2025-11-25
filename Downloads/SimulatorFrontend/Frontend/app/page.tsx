"use client";
import { useState, useEffect } from 'react';

export default function CoBuildLanding() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const building = document.querySelector('.building-container') as HTMLElement;
      if (building) {
        building.style.transform = `translateY(${scrolled * 0.3}px) rotateY(${scrolled * 0.05}deg)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSlide = () => {
    alert('Coming Soon! Stay tuned for our launch.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing! We'll notify you at ${email}`);
    setEmail('');
  };

  const handleBuildingHover = (e: React.MouseEvent<HTMLDivElement>, isHovering: boolean) => {
    const target = e.currentTarget;
    if (isHovering) {
      target.style.transform = 'scale(1.1) translateY(-10px)';
      target.style.transition = 'all 0.3s ease';
    } else {
      target.style.transform = 'scale(1) translateY(0)';
    }
  };

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');

        .building-container {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotateY(0deg); }
          50% { transform: translateY(-20px) rotateY(10deg); }
        }

        .building-box::before {
          content: '';
          position: absolute;
          width: 150px;
          height: 200px;
          background: linear-gradient(to bottom, #EF6B23, #DC6220);
          opacity: 0.6;
          border-radius: 10px;
          box-shadow: 0 0 30px rgba(239, 107, 35, 0.5);
        }

        .light {
          background: rgba(255, 200, 100, 0.8);
          border-radius: 2px;
          animation: flicker 3s infinite;
        }

        .light:nth-child(odd) {
          animation-delay: 0.5s;
        }

        @keyframes flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.3; }
        }

        .mini-building::after {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 8px,
            rgba(255, 200, 100, 0.3) 8px,
            rgba(255, 200, 100, 0.3) 10px
          );
        }

        .slider-button::after {
          content: '→';
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white overflow-x-hidden font-[Manrope]">
        {/* Header */}
        <header className="flex justify-between items-center py-[54px] px-10 max-w-[1440px] mx-auto">
          <div className="text-[32px] font-bold flex items-center gap-1">
            <span className="text-white">Co</span>
            <span className="text-[#EF6B23]">Build.</span>
          </div>
          <button className="bg-[#EF6B23] text-white px-8 py-3 rounded-2xl text-lg font-semibold hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(239,107,35,0.4)] transition-all duration-200">
            Download
          </button>
        </header>

        {/* Hero Section */}
        <section className="text-center py-20 px-5 relative">
          <div className="perspective-[1000px] mx-auto mb-10 max-w-[400px]">
            <div className="building-container w-[300px] h-[350px] mx-auto relative" style={{ transformStyle: 'preserve-3d' }}>
              <div className="building-box w-full h-full bg-gradient-to-br from-[rgba(115,115,115,0.3)] to-[rgba(75,75,75,0.5)] border-2 border-white/10 rounded-3xl flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="building-lights absolute w-[120px] h-[160px] grid grid-cols-4 gap-2 p-5 z-10">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="light" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="max-w-[579px] mx-auto my-10 relative">
            <div className="slider-base bg-gradient-to-br from-[rgba(148,148,148,0.3)] to-[rgba(132,132,132,0.3)] border border-[#898989] rounded-[64px] h-[74px] flex items-center justify-center relative overflow-hidden">
              <span className="text-[30px] font-bold text-[#EF6B23] tracking-tight">Slide Now</span>
              <div 
                className="slider-button absolute right-[5px] bg-gradient-to-b from-[#EF6B23] to-[#DC6220] shadow-[0_0_8px_rgba(0,0,0,0.4)] rounded-[64px] w-[146px] h-16 flex items-center justify-center cursor-pointer hover:translate-x-[-5px] transition-all duration-300"
                onClick={handleSlide}
              />
            </div>
          </div>
        </section>

        {/* Tokenization Section */}
        <section className="py-20 px-5 text-center relative">
          <div className="flex justify-center gap-4 mb-10">
            {[60, 100, 120, 85, 70].map((height, i) => (
              <div
                key={i}
                className="mini-building w-[60px] bg-gradient-to-b from-[rgba(200,150,100,0.6)] to-[rgba(100,80,60,0.8)] rounded-md relative shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                style={{ height: `${height}px` }}
                onMouseEnter={(e) => handleBuildingHover(e, true)}
                onMouseLeave={(e) => handleBuildingHover(e, false)}
              />
            ))}
          </div>

          <div className="tokenization-content">
            <h2 className="text-3xl sm:text-5xl font-bold leading-[1.35] tracking-tight mb-5">
              Real Estate Investments through Tokenization<br />
              <span className="text-[#EF6B23]">Real Estate Democratized</span>
            </h2>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-20 px-5 text-center">
          <h2 className="text-5xl sm:text-7xl font-bold text-[#EF6B23] tracking-tight mb-10">
            COMING SOON
          </h2>

          <h3 className="text-2xl sm:text-4xl font-bold tracking-tight mb-8">
            Join Our Community for the latest updates
          </h3>

          {/* Social Buttons */}
          <div className="flex justify-center gap-4 flex-wrap mb-20">
            {[
              { name: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' },
              { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              { name: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              { name: 'TikTok', icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' }
            ].map((social) => (
              <button
                key={social.name}
                className="flex items-center gap-2 px-5 py-3 border border-white rounded-xl bg-transparent text-white text-lg font-bold hover:bg-white/10 hover:translate-y-[-2px] transition-all duration-300 min-w-[140px]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d={social.icon} />
                </svg>
                {social.name}
              </button>
            ))}
          </div>

          {/* Email Form */}
          <div className="max-w-[714px] mx-auto">
            <h4 className="text-2xl sm:text-3xl font-bold tracking-tight mb-5">
              Register your email to get updates about the launch
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-white rounded-xl bg-transparent text-[#DFDFDF] text-lg focus:outline-none focus:border-[#EF6B23] placeholder:text-[#DFDFDF]"
                  placeholder="Enter Your email Address"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#EF6B23] text-white px-8 py-4 rounded-2xl text-lg font-bold whitespace-nowrap hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(239,107,35,0.4)] transition-all duration-300 w-full sm:w-auto"
              >
                Notify Me
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}