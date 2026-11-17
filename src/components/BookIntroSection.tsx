import React from 'react';
import { ArrowDown, BookOpen } from 'lucide-react';
import { BOOKS_DATA, BookKey } from '../data/archiveData';

interface BookIntroSectionProps {
  activeBookKey: BookKey;
  onSelectBook: (key: BookKey) => void;
}

/**
 * Window 2: About the Book Section
 * Positioned cleanly below the Author Section inside its own dedicated viewport
 * window. Houses the Book 1 / Book 2 tab selector and dynamically renders the
 * "About this Book" introductory prose for the chosen volume.
 */
export const BookIntroSection: React.FC<BookIntroSectionProps> = ({
  activeBookKey,
  onSelectBook,
}) => {
  const activeBook = BOOKS_DATA[activeBookKey];

  return (
    <section
      id="about-books"
      aria-labelledby="about-book-heading"
      className="min-h-[calc(100svh-3.5rem)] sm:min-h-[calc(100svh-4.5rem)] flex flex-col justify-center px-5 sm:px-10 md:px-14 py-10 sm:py-14 border-b border-[#B99D78]/35 bg-[#F5ECDB]/45"
    >
      <div className="max-w-4xl mx-auto w-full text-center">
        <p
          className="text-xs sm:text-sm tracking-[0.2em] uppercase text-[#8A3B1B] font-semibold mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Commemorative Volumes
        </p>

        {/* Book 1 / Book 2 Tabs Interface */}
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Select Storybook Volume"
            className="inline-flex items-center gap-2 p-1.5 rounded-lg bg-[#E6D5B8]/90 border border-[#B89B73]/55 shadow-inner"
          >
            {(['book1', 'book2'] as BookKey[]).map((key) => {
              const book = BOOKS_DATA[key];
              const isActive = activeBookKey === key;
              return (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls="about-book-panel"
                  onClick={() => onSelectBook(key)}
                  className={`px-7 sm:px-10 py-2.5 min-h-[44px] rounded-md text-sm sm:text-base font-semibold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] cursor-pointer ${
                    isActive
                      ? 'bg-[#8A3B1B] text-[#FBF5E8] shadow-[0_3px_10px_rgba(92,38,14,0.35)]'
                      : 'text-[#4F3725] hover:text-[#2A1B10] hover:bg-[#F5EBD9]/75'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {book.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic "About this Book" Introductory Content */}
        <div
          id="about-book-panel"
          role="tabpanel"
          className="mt-8 sm:mt-10 px-2 transition-opacity duration-200"
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#7D4B28] font-medium">
            {activeBook.subtitle} · {activeBook.yearSpan}
          </p>

          <h2
            id="about-book-heading"
            className="text-2xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#2B1B10] mt-2 leading-tight [text-wrap:balance]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeBook.title}
          </h2>

          <div className="w-24 h-px bg-[#A67C46]/55 mx-auto my-6" aria-hidden="true" />

          <p className="text-lg sm:text-xl text-[#362519] leading-[1.78] max-w-2xl mx-auto">
            {activeBook.aboutParagraph}
          </p>

          <p className="mt-4 text-sm sm:text-base italic text-[#6B4A32]">
            {activeBook.pages.length} illustrated archival folios · A4 Landscape Edition
          </p>

          {/* Direct CTA to scroll cleanly into the Flipbook Section below */}
          <div className="mt-8 flex justify-center">
            <a
              href="#flipbook-section"
              className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] rounded-md bg-[#2C1D13] text-[#FBF4E6] hover:bg-[#8A3B1B] border border-[#D8A856]/45 text-sm uppercase tracking-[0.12em] font-semibold whitespace-nowrap transition-colors duration-200 shadow-[0_6px_18px_rgba(28,16,8,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <BookOpen className="w-4 h-4 text-[#E6BA72]" aria-hidden="true" />
              <span>Open {activeBook.tabLabel}</span>
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
