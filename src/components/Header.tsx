import React from 'react';
import logo from '../assets/logos/logo.png';
import logo_2 from '../assets/logos/logo_2.png';

/**
 * Sticky Top Navigation Bar
 * Uses a balanced 3-column CSS Grid:
 *   Left:   100th Birthday Celebration emblem/logo placeholder
 *   Center: Main website title
 *   Right:  Seminary crest/logo placeholder
 */
export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#1C140E]/90 backdrop-blur-md border-b border-[#D6B88D]/25 shadow-[0_6px_24px_rgba(10,6,3,0.45)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center gap-2 sm:gap-6">
        {/* LEFT ZONE: 100th Birthday Celebration Logo Placeholder
            To use a custom image file, replace the SVG seal below with:
            <img src="/path/to/100th-birthday-logo.png" alt="100th Birthday Celebration" className="h-9 sm:h-11 w-auto object-contain" />
        */}
        <div className="flex items-center justify-start gap-2.5 shrink-0">
          <div
            className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#D8A856]/60 bg-[#2C1E14]/90 text-[#F2D399] shadow-inner"
            aria-label="100th Birthday Celebration Emblem"
          >
            <img src={logo} alt="100th Birthday Celebration" className="h-9 sm:h-11 w-auto object-contain" />
            
          </div>
          <span className="hidden lg:inline-block text-xs tracking-[0.14em] uppercase text-[#E4CFAF] font-medium whitespace-nowrap">
            Centenary Jubilee (1926 - 2026)
          </span>
        </div>

        {/* CENTER ZONE: Main Title of the Website */}
        <div className="flex flex-col items-center text-center text-center min-w-0 px-1">
          <h1
            className="text-sm sm:text-xl md:text-2xl font-semibold tracking-[0.06em] text-[#FBF4E6] leading-tight whitespace-nowrap"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Prof. Dr Lucien Legrand
          </h1>
          <p className="hidden sm:block text-xs tracking-[0.18em] uppercase text-[#D8B47C] mt-0.5 whitespace-nowrap">
            A Missionary’s journey to the Biblical Lands. 1950 - 1952
          </p>
        </div>

        {/* RIGHT ZONE: Seminary Crest / Logo Placeholder
            To use your official Seminary crest image, replace the SVG crest below with:
            <img src="/path/to/seminary-crest.png" alt="Seminary Crest" className="h-9 sm:h-11 w-auto object-contain" />
        */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <span className="hidden lg:inline-block text-xs tracking-[0.14em] uppercase text-[#E4CFAF] font-medium whitespace-nowrap">
            St. Peter's
          </span>
          <div
            className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-[#D8A856]/60 bg-[#2C1E14]/90 text-[#F2D399] shadow-inner"
            aria-label="Seminary Crest Placeholder"
          >
          <img src={logo_2} alt="Seminary Crest" className="h-9 sm:h-11 w-auto object-contain" />
          </div>
        </div>
      </div>
    </header>
  );
};
