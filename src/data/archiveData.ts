/**
 * ============================================================================
 * ARCHIVE DATA CONFIGURATION
 * ============================================================================
 * Replace the imported placeholder assets below with your final high-resolution
 * archival images (either ES imports from src/assets/, or public URLs from
 * /public/images/...).
 */

// 1. BACKGROUND IMAGE:
// Replace this import with your own background image (e.g., an ancient dirt
// path, footsteps, or classical ruins).
import pilgrimageBackdrop from '../assets/images/pilgrimage_backdrop_1794760646865.jpg';

// 2. AUTHOR PORTRAIT PHOTO:
// Replace this import with Prof. Dr. Lucien Legrand's photograph.
import scholarPortrait from '../assets/images/Fr_Legrand_2.jpeg';

// 3. BOOK PAGE PLATES (A4 Landscape high-resolution images):
// Replace or expand these imports with the exported A4 landscape pages
// (297mm x 210mm aspect ratio) for Book 1 and Book 2.
import book1CoverPlate from '../assets/images/book1_cover_plate_1794760647314.jpg';
import book1SpreadPlate from '../assets/images/book1_spread_plate_1794760648596.jpg';
import book2CoverPlate from '../assets/images/book2_cover_plate_1794760648649.jpg';
import book2SpreadPlate from '../assets/images/book2_spread_plate_1794760648788.jpg';

export type BookKey = 'book1' | 'book2';

export interface BookPage {
  id: string;
  pageNumber: number;
  /** High-resolution A4 landscape image URL (aspect ratio 297:210) */
  imageUrl: string;
  alt: string;
  /** Set isHardCover to true on first and last pages for tactile cover stiffness */
  isHardCover?: boolean;
  /** Optional archival caption overlay when using illustrative plates */
  captionTitle?: string;
  captionText?: string;
  folioLabel?: string;
}

export interface BookArchive {
  key: BookKey;
  tabLabel: string;
  title: string;
  subtitle: string;
  yearSpan: string;
  aboutParagraph: string;
  pages: BookPage[];
}

export const BACKGROUND_IMAGE_URL: string = pilgrimageBackdrop;

export const AUTHOR_INFO = {
  name: 'Prof. Dr. Lucien Legrand',
  honorific: 'M.E.P. · Centenary Tribute (1926 – 2026)',
  photoUrl: scholarPortrait,
  photoAlt: 'Portrait of Prof. Dr. Lucien Legrand seated in a sunlit seminary library surrounded by biblical manuscripts',
  shortBio: [
    'Born in France in 1926 and ordained a priest of the Paris Foreign Missions Society (M.E.P.), Prof. Dr. Lucien Legrand dedicated more than seven decades to biblical exegesis, priestly formation, and cross-cultural theological dialogue in India.',
    'Serving for generations at St. Peter’s Pontifical Institute in Bengaluru, he illuminated the Scriptures through seminal works on the Infancy Narratives, the Letters of St. Paul, and the biblical foundations of mission—always uniting rigorous philological scholarship with pastoral warmth.',
    'This digital storybook archive commemorates his 100th birthday, preserving two commemorative volumes of memories, illustrated journeys, and reflections gathered by colleagues, former students, and friends across the world.',
  ],
  quote: '“The Word is never a relic of stone alone; it is a living road walked together across languages, centuries, and hearts.”',
};


export const BOOK_1_PAGES: BookPage[] = Array.from({ length: 165 }, (_, i) => {
  const pageNum = i + 1;
  const paddedNum = String(pageNum).padStart(3, '0'); 
  
  return {
    id: `b1-p${pageNum}`,
    pageNumber: pageNum,
    imageUrl: `${import.meta.env.BASE_URL}book1/page-${paddedNum}.webp`,
    alt: `Volume I - Page ${pageNum}`,
    isHardCover: pageNum === 1 || pageNum === 165, // Keeps the thick cover physics for first/last page
  };
});

// Auto-generate 160 pages for Volume II from the public/book2 folder
export const BOOK_2_PAGES: BookPage[] = Array.from({ length: 165 }, (_, i) => {
  const pageNum = i + 1;
  const paddedNum = String(pageNum).padStart(3, '0'); 
  
  return {
    id: `b2-p${pageNum}`,
    pageNumber: pageNum,
    imageUrl: `${import.meta.env.BASE_URL}book2/page-${paddedNum}.webp`,
    alt: `Volume II - Page ${pageNum}`,
    isHardCover: pageNum === 1 || pageNum === 165,
  };
});


export const BOOKS_DATA: Record<BookKey, BookArchive> = {
  book1: {
    key: 'book1',
    tabLabel: 'Book 1',
    title: 'Footsteps in Antiquity: Jerusalem',
    subtitle: 'Volume I · Jerusalem',
    yearSpan: '',
    aboutParagraph:
      "About this Book: Volume I invites readers into the heart of the Holy City. Through the lens of Prof. Dr. Lucien Legrand’s personal pilgrimages and profound scholarship, this collection retraces ancient footsteps through Jerusalem's sacred streets. From the golden hues of the Mount of Olives to the timeless stone architecture, it offers a deeply reflective journey into the historical and spiritual epicenter of the biblical narrative.",
    pages: BOOK_1_PAGES,
  },
  book2: {
    key: 'book2',
    tabLabel: 'Book 2',
    title: 'Footsteps in Antiquity: Trans-Jordan',
    subtitle: 'Volume II · Trans-Jordan',
    yearSpan: '',
    aboutParagraph:
      'About this Book: Volume II journeys eastward into the rugged, historic landscapes of the Transjordan. Venturing beyond the Jordan River, Dr. Legrand explores the ancient routes, desert vistas, and archaeological remnants of biblical antiquity. This volume captures the silent majesty of the wilderness, bringing to life the rich history and enduring faith embedded in the lands of Moab, Edom, and Gilead.',
    pages: BOOK_2_PAGES,
  },
};
