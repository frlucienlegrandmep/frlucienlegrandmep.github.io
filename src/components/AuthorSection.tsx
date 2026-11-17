import React, { useState } from 'react';
import { BookOpen, ArrowDown } from 'lucide-react';
import { AUTHOR_INFO } from '../data/archiveData';

/**
 * Window 1: About the Author Section
 * Fits completely within the initial viewport below the sticky header so visitors
 * can read the full portrait, biography, and quote without scrolling.
 */
export const AuthorSection: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="about-author"
      aria-labelledby="about-author-heading"
      className="min-h-[calc(100svh-3.5rem)] sm:min-h-[calc(100svh-4.5rem)] flex flex-col justify-center px-5 sm:px-10 md:px-14 py-6 sm:py-8 border-b border-[#B99D78]/35"
    >
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-[210px_1fr] lg:grid-cols-[240px_1fr] gap-6 md:gap-10 items-center">
        {/* Softly Framed Circular Author Portrait */}
        <div className="flex flex-col items-center">
          <div className="relative p-1.5 sm:p-2 rounded-full border border-[#A67C46]/55 bg-gradient-to-br from-[#F3E5CE] to-[#DFC8A6] shadow-[0_14px_34px_rgba(52,32,16,0.22)]">
            <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-[#7E4A25]/45 bg-[#E6D4B8] relative">
              {!imgError ? (
                <img
                  src={AUTHOR_INFO.photoUrl}
                  alt={AUTHOR_INFO.photoAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top sepia-[0.12] contrast-[1.03]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E7D5BA] to-[#CBB08A] text-[#4E3422] p-4 text-center">
                  <BookOpen className="w-8 h-8 mb-2 opacity-75" />
                  <span
                    className="text-base font-semibold"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    L. Legrand
                  </span>
                  <span className="text-xs opacity-80">1926 – 2026</span>
                </div>
              )}
            </div>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm italic text-[#6B4A32] text-center">
            {AUTHOR_INFO.honorific}
          </p>
        </div>

        {/* Short Biography Prose — compact measure so everything fits cleanly in Window 1 */}
        <div className="text-center md:text-left">
          <p
            className="text-xs tracking-[0.18em] uppercase text-[#8A3B1B] font-semibold mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            About the Scholar &amp; Priest
          </p>

          <h2
            id="about-author-heading"
            className="text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold text-[#2B1B10] tracking-tight leading-snug mb-3 [text-wrap:balance]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {AUTHOR_INFO.name}
          </h2>

          <div className="space-y-2.5 text-[#362519] text-base sm:text-[1.08rem] leading-[1.62] max-w-2xl mx-auto md:mx-0">
            {AUTHOR_INFO.shortBio.map((paragraph, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'first-letter:text-4xl first-letter:font-semibold first-letter:text-[#8A3B1B] first-letter:mr-2 first-letter:float-left first-letter:leading-[0.86] first-letter:pt-1'
                    : undefined
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Editorial Pull-Quote */}
          <blockquote className="mt-4 py-2.5 border-y border-[#B99D78]/40 text-[#5C3D26] italic text-base sm:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
            {AUTHOR_INFO.quote}
          </blockquote>

          {/* Smooth Navigation Cue to Next Window (About the Books) */}
          <div className="mt-4 flex justify-center md:justify-start">
            <a
              href="#about-books"
              className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.14em] font-semibold text-[#8A3B1B] hover:text-[#5F250D] transition-colors py-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A3B1B]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>About the Books</span>
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
