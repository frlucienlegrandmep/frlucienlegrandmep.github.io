import React from 'react';

/**
 * Minimalist Footer Section
 * Matches the warm parchment & sepia aesthetic with archival details and credit line.
 * Strictly free of social media icons or social links.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#B99D78]/40 bg-[#EFE4D0]/75 px-5 sm:px-10 py-7 sm:py-8 text-center">
      <div className="max-w-4xl mx-auto space-y-2">
        <p
          className="text-sm sm:text-base font-semibold tracking-[0.08em] text-[#3A2516]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Prof. Dr Lucien Legrand Centenary Archive
        </p>

        {/* Physical Address & Archival Location */}
        <p className="text-sm sm:text-base text-[#5C412B]">
          St Peter’s Pontifical Seminary & Institute · Malleswaram West, Bengaluru 560055, India
        </p>

        {/* Copyright & Designer Credit Line
            Replace [Name] below with the actual designer or contributor name.
        */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-[#6E5138]">
          <span>&copy; {new Date().getFullYear()}  All rights reserved.</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Designed by Tony Alosius</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Developed using Google AI Studio</span>
        </div>
      </div>
    </footer>
  );
};
