import React, { useState } from 'react';
import { BACKGROUND_IMAGE_URL, BookKey } from './data/archiveData';
import { Header } from './components/Header';
import { AuthorSection } from './components/AuthorSection';
import { BookIntroSection } from './components/BookIntroSection';
import { FlipbookViewer } from './components/FlipbookViewer';
import { Footer } from './components/Footer';

/**
 * Main Centenary Digital Storybook Archive Application
 * Organizes the experience into clean, non-overlapping sections:
 *   1. Author Section (fits within initial opening window without scrolling)
 *   2. About the Book Section (Book 1 / Book 2 tabs + dynamic introduction)
 *   3. Interactive A4 Landscape Flipbook Reader
 *   4. Minimalist Footer
 */
export default function App() {
  const [bgFailed, setBgFailed] = useState(false);
  const [activeBookKey, setActiveBookKey] = useState<BookKey>('book1');

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-[#8A3B1B]/20 selection:text-[#2A1B10]">
      {/* Fixed Full-Viewport Historical Pilgrimage Backdrop */}
      <div className="fixed inset-0 -z-20 bg-[#1B120B] overflow-hidden" aria-hidden="true">
        {!bgFailed && (
          <img
            src={BACKGROUND_IMAGE_URL}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover object-center opacity-75 sepia-[0.22] scale-[1.02]"
          />
        )}
      </div>

      {/* Heavy Warm Vignette & Atmospheric Sunset Overlay for Readability */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(36, 22, 12, 0.42) 0%, rgba(20, 12, 7, 0.84) 72%, rgba(12, 7, 4, 0.94) 100%)',
        }}
      />

      {/* Sticky 3-Column Header */}
      <Header />

      {/* Central Frosted-Parchment Reading Sanctuary */}
      <main className="flex-1 w-full max-w-[1420px] mx-auto pt-0 pb-6 px-2 sm:px-4">
        <div className="bg-[#FBF6EC]/94 backdrop-blur-md border border-[#D4BC96]/55 rounded-xl shadow-[0_24px_64px_rgba(10,5,2,0.58)] overflow-hidden">
          <AuthorSection />
          <BookIntroSection activeBookKey={activeBookKey} onSelectBook={setActiveBookKey} />
          <FlipbookViewer activeBookKey={activeBookKey} onSelectBook={setActiveBookKey} />
          <Footer />
        </div>
      </main>
    </div>
  );
}
