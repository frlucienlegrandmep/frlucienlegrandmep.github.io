import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Maximize2,
  Minimize2,
  FileText,
  Columns2,
} from 'lucide-react';
import { BOOKS_DATA, BookKey, BookPage } from '../data/archiveData';

interface FlipbookViewerProps {
  activeBookKey: BookKey;
  onSelectBook: (key: BookKey) => void;
}

type ViewMode = 'single' | 'spread';

interface LensState {
  visible: boolean;
  x: number;
  y: number;
  imgSrc: string;
  scaledW: number;
  scaledH: number;
  offsetX: number;
  offsetY: number;
}

const A4_RATIO = 297 / 210; // Exact A4 Landscape aspect ratio (~1.4142857)
const ZOOM_STEPS = [1, 1.25, 1.5, 1.75, 2, 2.25];
const LENS_SIZE = 208;
const LENS_MAGNIFICATION = 2.25;

/**
 * Window 3: Interactive A4 Landscape Flipbook Reader
 * - Optimized proportions for high-resolution single A4 landscape PNGs (baked-in text & art)
 * - Supports Single Page (large readable view) & 2-Page Spread toggle
 * - Includes Zoom In / Zoom Out / Reset with smooth click-and-drag panning
 * - Includes an interactive 2.25x Optical Magnifier Loupe
 * - Includes Fullscreen Theater Mode (with seamless fallback inside iframes)
 */
export const FlipbookViewer: React.FC<FlipbookViewerProps> = ({
  activeBookKey,
  onSelectBook,
}) => {
  const activeBook = BOOKS_DATA[activeBookKey];
  const totalPages = activeBook.pages.length;

  const [currentPage, setCurrentPage] = useState<number>(0);
  const currentPageRef = useRef<number>(0);
  const prevBookKeyRef = useRef<BookKey>(activeBookKey);

  // Default to 'single' A4 landscape view so baked-in text on non-editable PNGs is large and legible
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [zoom, setZoom] = useState<number>(1);
  const [isMagnifierOn, setIsMagnifierOn] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState<boolean>(false);
  const isFullscreen = isNativeFullscreen || isFallbackFullscreen;

  const [bookDims, setBookDims] = useState<{
    pageW: number;
    pageH: number;
    isTwoPage: boolean;
  }>({ pageW: 840, pageH: 594, isTwoPage: false });

  const [lens, setLens] = useState<LensState>({
    visible: false,
    x: 0,
    y: 0,
    imgSrc: '',
    scaledW: 0,
    scaledH: 0,
    offsetX: 0,
    offsetY: 0,
  });

  // Pan state when zoom > 1
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(
    null
  );

  const fullscreenRootRef = useRef<HTMLElement | null>(null);
  const stageMeasureRef = useRef<HTMLDivElement | null>(null);
  const zoomViewportRef = useRef<HTMLDivElement | null>(null);
  const mountContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  // Sync ref with currentPage state
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Reset page & zoom when switching between Book 1 and Book 2
  useEffect(() => {
    if (prevBookKeyRef.current !== activeBookKey) {
      prevBookKeyRef.current = activeBookKey;
      currentPageRef.current = 0;
      setCurrentPage(0);
      setZoom(1);
      setLens((prev) => ({ ...prev, visible: false }));
    }
  }, [activeBookKey]);

  // Measure available stage width & height and calculate exact A4 landscape dimensions
  const recalculateDimensions = useCallback(() => {
    const stageEl = stageMeasureRef.current;
    if (!stageEl) return;

    const availW = Math.max(240, stageEl.clientWidth);
    const viewportH = window.innerHeight;

    if (viewMode === 'single' || availW < 560) {
      const maxW = isFullscreen ? 1320 : 1120;
      const maxH = isFullscreen ? Math.floor(viewportH * 0.8) : Math.min(Math.floor(viewportH * 0.74), 790);
      const pageW = Math.max(240, Math.floor(Math.min(availW, maxW, maxH * A4_RATIO)));
      const pageH = Math.floor(pageW / A4_RATIO);
      setBookDims((prev) =>
        prev.pageW === pageW && prev.pageH === pageH && !prev.isTwoPage
          ? prev
          : { pageW, pageH, isTwoPage: false }
      );
    } else {
      const maxPageW = isFullscreen ? 740 : 650;
      const maxH = isFullscreen ? Math.floor(viewportH * 0.8) : Math.min(Math.floor(viewportH * 0.72), 620);
      const pageW = Math.max(240, Math.floor(Math.min(availW / 2, maxPageW, maxH * A4_RATIO)));
      const pageH = Math.floor(pageW / A4_RATIO);
      setBookDims((prev) =>
        prev.pageW === pageW && prev.pageH === pageH && prev.isTwoPage
          ? prev
          : { pageW, pageH, isTwoPage: true }
      );
    }
  }, [viewMode, isFullscreen]);

  // Re-measure on resize, viewMode change, or fullscreen toggle
  useEffect(() => {
    const rafId = requestAnimationFrame(() => recalculateDimensions());
    const stageEl = stageMeasureRef.current;
    if (!stageEl) return () => cancelAnimationFrame(rafId);

    const observer = new ResizeObserver(() => {
      recalculateDimensions();
    });
    observer.observe(stageEl);
    window.addEventListener('resize', recalculateDimensions);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', recalculateDimensions);
    };
  }, [recalculateDimensions]);

  // Listen to browser fullscreen events and Escape key for fallback fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      const active = document.fullscreenElement === fullscreenRootRef.current;
      setIsNativeFullscreen(active);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFallbackFullscreen) {
        setIsFallbackFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFallbackFullscreen]);

  // Block right-click in both Single Page and Spread modes (capture phase)
  useEffect(() => {
    const stage = stageMeasureRef.current;
    if (!stage) return;

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    stage.addEventListener('contextmenu', blockContextMenu, { capture: true });
    return () => {
      stage.removeEventListener('contextmenu', blockContextMenu, { capture: true });
    };
  }, []);

  /**
   * Build each page element outside React reconciliation so StPageFlip
   * controls `.stf__item` without DOM conflicts. Uses `object-contain`
   * inside `.archival-page-inner` so baked-in PNG text near edges is never cropped.
   */
  const buildPageElement = useCallback((page: BookPage, index: number): HTMLElement => {
    const pageEl = document.createElement('div');
    if (page.isHardCover) {
      pageEl.setAttribute('data-density', 'hard');
    }

    const inner = document.createElement('div');
    inner.className = `archival-page-inner ${
      index % 2 === 0 ? 'archival-page-inner--right' : 'archival-page-inner--left'
    }`;

    const img = document.createElement('img');
    img.src = page.imageUrl;
    img.alt = page.alt;
    img.referrerPolicy = 'no-referrer';
    img.draggable = false;
    img.oncontextmenu = (e) => e.preventDefault();
    img.style.setProperty('-webkit-touch-callout', 'none');
    img.className = 'w-full h-full object-contain bg-[#F6EFE2] block select-none';

    img.onerror = () => {
      img.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.className =
        'w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#EFE2CB] to-[#D8C09B] text-[#3F2918]';
      fallback.innerHTML = `<p style="font-family: Cinzel, serif; font-size: 1rem; font-weight: 600;">${
        page.captionTitle ?? `Page ${page.pageNumber}`
      }</p>`;
      inner.prepend(fallback);
    };

    inner.appendChild(img);

    if (page.captionTitle || page.captionText) {
      const overlay = document.createElement('div');
      overlay.className =
        'absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-4 pointer-events-none flex justify-center';

      const card = document.createElement('div');
      card.className =
        'w-full max-w-[92%] bg-[#FBF6EC]/92 backdrop-blur-[2px] border border-[#9E7B4F]/45 px-3 py-2 sm:px-4 sm:py-2.5 shadow-[0_6px_18px_rgba(32,18,8,0.22)] text-center';

      if (page.folioLabel) {
        const folio = document.createElement('p');
        folio.className =
          'text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#8A3B1B] font-semibold mb-0.5';
        folio.style.fontFamily = 'var(--font-display)';
        folio.textContent = page.folioLabel;
        card.appendChild(folio);
      }

      if (page.captionTitle) {
        const title = document.createElement('h4');
        title.className = 'text-xs sm:text-sm font-semibold text-[#2A1B10] leading-snug';
        title.style.fontFamily = 'var(--font-display)';
        title.textContent = page.captionTitle;
        card.appendChild(title);
      }

      if (page.captionText) {
        const desc = document.createElement('p');
        desc.className = 'text-xs sm:text-sm text-[#3F2B1D] leading-snug mt-0.5 line-clamp-2';
        desc.style.fontFamily = 'var(--font-serif)';
        desc.textContent = page.captionText;
        card.appendChild(desc);
      }

      overlay.appendChild(card);
      inner.appendChild(overlay);
    }

    pageEl.appendChild(inner);
    return pageEl;
  }, []);

  // Initialize / re-initialize PageFlip with exact measured A4 landscape dimensions
  useEffect(() => {
    const container = mountContainerRef.current;
    if (!container) return;

    const { pageW, pageH, isTwoPage } = bookDims;
    const totalBookW = isTwoPage ? pageW * 2 : pageW;
    const preservedStartPage = Math.min(currentPageRef.current, activeBook.pages.length - 1);

    container.innerHTML = '';
    const bookHost = document.createElement('div');
    bookHost.style.width = `${totalBookW}px`;
    bookHost.style.margin = '0 auto';
    container.appendChild(bookHost);

    const pageFlip = new PageFlip(bookHost, {
      width: pageW,
      height: pageH,
      size: 'fixed',
      startPage: preservedStartPage,
      drawShadow: true,
      flippingTime: 750,
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0.5,
      showCover: isTwoPage,
      mobileScrollSupport: true,
      swipeDistance: 30,
      clickEventForward: false,
      useMouseEvents: true,
      showPageCorners: true,
      disableFlipByClick: false,
    });

    const pageNodes = activeBook.pages.map((page, idx) => buildPageElement(page, idx));

    pageFlip.on('init', (e) => {
      if (typeof e?.data?.page === 'number') {
        setCurrentPage(e.data.page);
      }
    });

    pageFlip.on('flip', (e) => {
      if (typeof e?.data === 'number') {
        setCurrentPage(e.data);
      }
    });

    pageFlip.loadFromHTML(pageNodes);
    pageFlipRef.current = pageFlip;

    return () => {
      try {
        pageFlip.destroy();
      } catch {
        // Safe teardown
      }
      pageFlipRef.current = null;
    };
  }, [activeBookKey, activeBook.pages, bookDims, buildPageElement]);

  // Navigation handlers
  const isFirstPage = currentPage <= 0;
  const isLastPage = currentPage >= totalPages - 1;

  const handlePrevPage = () => {
    if (isFirstPage) return;
    pageFlipRef.current?.flipPrev('top');
  };

  const handleNextPage = () => {
    if (isLastPage) return;
    pageFlipRef.current?.flipNext('top');
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetPage = Number(e.target.value);
    setCurrentPage(targetPage);
    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.getRender()?.finishAnimation();
      } catch {
        // Safe guard
      }
      pageFlipRef.current.turnToPage(targetPage);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = ZOOM_STEPS.find((z) => z > prev);
      return next ?? prev;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const reversed = [...ZOOM_STEPS].reverse();
      const next = reversed.find((z) => z < prev);
      return next ?? 1;
    });
  };

  const handleZoomReset = () => {
    setZoom(1);
    if (zoomViewportRef.current) {
      zoomViewportRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  // Fullscreen toggle (Native API with seamless CSS overlay fallback for sandboxed iframes)
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore exit errors
        }
      }
      setIsNativeFullscreen(false);
      setIsFallbackFullscreen(false);
      return;
    }

    const root = fullscreenRootRef.current;
    if (root && typeof root.requestFullscreen === 'function') {
      try {
        await root.requestFullscreen();
        setIsNativeFullscreen(true);
        return;
      } catch {
        // Fall back to full-viewport CSS theater mode when iframe blocks native Fullscreen API
      }
    }
    setIsFallbackFullscreen(true);
  };

  // Magnifier pointer tracking across visible page images
  const updateMagnifierFromPointer = (clientX: number, clientY: number) => {
    const container = mountContainerRef.current;
    const stage = stageMeasureRef.current;
    if (!container || !stage) return;

    const images = Array.from(
      container.querySelectorAll<HTMLImageElement>('.archival-page-inner img')
    );

    let matchedImg: HTMLImageElement | null = null;
    let matchedRect: DOMRect | null = null;

    for (const img of images) {
      if (img.style.display === 'none') continue;
      const rect = img.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        matchedImg = img;
        matchedRect = rect;
        break;
      }
    }

    if (!matchedImg || !matchedRect) {
      setLens((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const lensX = clientX - stageRect.left;
    const lensY = clientY - stageRect.top;

    const relX = clientX - matchedRect.left;
    const relY = clientY - matchedRect.top;

    const scaledW = matchedRect.width * LENS_MAGNIFICATION;
    const scaledH = matchedRect.height * LENS_MAGNIFICATION;
    const offsetX = LENS_SIZE / 2 - relX * LENS_MAGNIFICATION;
    const offsetY = LENS_SIZE / 2 - relY * LENS_MAGNIFICATION;

    setLens({
      visible: true,
      x: lensX,
      y: lensY,
      imgSrc: matchedImg.src,
      scaledW,
      scaledH,
      offsetX,
      offsetY,
    });
  };

  // Drag-to-pan handlers when zoomed in (> 100%) and magnifier is off
  const handlePanPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || isMagnifierOn) return;
    const vp = zoomViewportRef.current;
    if (!vp) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: vp.scrollLeft,
      scrollTop: vp.scrollTop,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePanPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMagnifierOn) {
      updateMagnifierFromPointer(e.clientX, e.clientY);
      return;
    }
    if (!isPanning || !panStartRef.current || !zoomViewportRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    zoomViewportRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    zoomViewportRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handlePanPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if not captured
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevPage();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextPage();
    }
  };

  const formatPageLabel = () => {
    if (!bookDims.isTwoPage || currentPage === 0 || currentPage >= totalPages - 1) {
      return `Page ${currentPage + 1}`;
    }
    const rightPage = Math.min(currentPage + 2, totalPages);
    return rightPage > currentPage + 1
      ? `Pages ${currentPage + 1}–${rightPage}`
      : `Page ${currentPage + 1}`;
  };

  const totalBookW = bookDims.isTwoPage ? bookDims.pageW * 2 : bookDims.pageW;
  const totalBookH = bookDims.pageH;

  return (
    <section
      ref={fullscreenRootRef}
      id="flipbook-section"
      aria-label="Digital Storybook Flipbook Reader"
      onKeyDown={handleKeyDown}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#1B120B] text-[#FBF6EC] flex flex-col justify-between px-3 sm:px-8 py-4 sm:py-5 overflow-y-auto'
          : 'min-h-[calc(100svh-3.5rem)] sm:min-h-[calc(100svh-4.5rem)] flex flex-col justify-center px-3 sm:px-6 md:px-10 py-6 sm:py-8'
      }
    >
      {/* Centered Header Hierarchy: 1) Book 1 / Book 2 Tabs  2) Book Name & Details  3) Spaced Reading Options */}
      <div
        className={`max-w-[1340px] mx-auto w-full flex flex-col items-center text-center gap-3.5 mb-5 pb-4 border-b ${
          isFullscreen ? 'border-[#D8A856]/25' : 'border-[#B99D78]/35'
        }`}
      >
        {/* 1. Clickable Tabs: Book 1 & Book 2 */}
        <div
          role="tablist"
          aria-label="Switch Storybook Volume"
          className={`inline-flex items-center gap-2 p-1.5 rounded-lg border shadow-inner ${
            isFullscreen
              ? 'bg-[#2B1D13] border-[#D8A856]/30'
              : 'bg-[#E9DAC1]/90 border-[#B89B73]/55'
          }`}
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
                onClick={() => onSelectBook(key)}
                className={`px-6 sm:px-8 py-2 min-h-[42px] rounded-md text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] ${
                  isActive
                    ? 'bg-[#8A3B1B] text-[#FBF5E8] shadow-sm'
                    : isFullscreen
                    ? 'text-[#E6D5B8] hover:text-white hover:bg-[#3B281B]'
                    : 'text-[#4F3725] hover:text-[#2A1B10] hover:bg-[#F5EBD9]/75'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {book.tabLabel}
              </button>
            );
          })}
        </div>

        {/* 2. Book Name, Subtitle & Year Span */}
        <div className="max-w-2xl px-2">
          <p
            className={`text-xs uppercase tracking-[0.18em] font-semibold ${
              isFullscreen ? 'text-[#E6BA72]' : 'text-[#8A3B1B]'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeBook.subtitle} · {activeBook.yearSpan}
          </p>
          <h3
            className={`text-xl sm:text-2xl lg:text-[1.7rem] font-semibold leading-snug mt-0.5 [text-wrap:balance] ${
              isFullscreen ? 'text-[#FBF4E6]' : 'text-[#2B1B10]'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeBook.title}
          </h3>
        </div>

        {/* 3. Centered & Generously Spaced Reading Options */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-1">
          {/* Single Page vs 2-Page Spread Toggle */}
          <div
            className={`hidden sm:inline-flex items-center p-1 rounded-md border ${
              isFullscreen
                ? 'bg-[#2B1D13] border-[#D8A856]/30'
                : 'bg-[#E9DAC1]/85 border-[#B89B73]/50'
            }`}
            role="group"
            aria-label="Page layout mode"
          >
            <button
              type="button"
              onClick={() => setViewMode('single')}
              aria-pressed={viewMode === 'single'}
              title="Single large A4 page (best for reading small text)"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-[#2C1D13] text-[#FBF4E6]'
                  : isFullscreen
                  ? 'text-[#E6D5B8] hover:bg-[#3B281B]'
                  : 'text-[#4F3725] hover:bg-[#F5EBD9]/75'
              }`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Single Page</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spread')}
              aria-pressed={viewMode === 'spread'}
              title="Two-page open book spread"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === 'spread'
                  ? 'bg-[#2C1D13] text-[#FBF4E6]'
                  : isFullscreen
                  ? 'text-[#E6D5B8] hover:bg-[#3B281B]'
                  : 'text-[#4F3725] hover:bg-[#F5EBD9]/75'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Spread</span>
            </button>
          </div>

          {/* Zoom Out / Percentage / Zoom In */}
          <div
            className={`inline-flex items-center rounded-md border p-0.5 ${
              isFullscreen
                ? 'bg-[#2B1D13] border-[#D8A856]/30 text-[#FBF4E6]'
                : 'bg-[#EFE3CE]/90 border-[#B89B73]/55 text-[#2B1B10]'
            }`}
            role="group"
            aria-label="Zoom controls"
          >
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              aria-label="Zoom out"
              title="Zoom out"
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded disabled:opacity-40 hover:bg-black/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              title="Reset zoom to 100%"
              className="px-2.5 min-h-[38px] text-xs font-semibold tabular-nums whitespace-nowrap shrink-0 hover:bg-black/10 rounded transition-colors cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              aria-label="Zoom in"
              title="Zoom in"
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded disabled:opacity-40 hover:bg-black/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={handleZoomReset}
                aria-label="Reset zoom"
                title="Reset zoom"
                className="p-2 min-w-[36px] min-h-[38px] flex items-center justify-center rounded hover:bg-black/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Interactive Magnifier Lens Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsMagnifierOn((prev) => !prev);
              setLens((prev) => ({ ...prev, visible: false }));
            }}
            aria-pressed={isMagnifierOn}
            title="Toggle 2.25x optical magnifier lens"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] ${
              isMagnifierOn
                ? 'bg-[#8A3B1B] border-[#F2C97D]/60 text-[#FBF5E8] shadow-sm'
                : isFullscreen
                ? 'bg-[#2B1D13] border-[#D8A856]/30 text-[#FBF4E6] hover:bg-[#3B281B]'
                : 'bg-[#EFE3CE]/90 border-[#B89B73]/55 text-[#3B281B] hover:bg-[#E5D3B5]'
            }`}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Magnifier</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen reader'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-md border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] ${
              isFullscreen
                ? 'bg-[#D8A856] border-[#F2C97D] text-[#1D120B] hover:bg-[#E7BD72]'
                : 'bg-[#2C1D13] border-[#D8A856]/45 text-[#FBF4E6] hover:bg-[#8A3B1B]'
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" aria-hidden="true" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Maximized Flipbook Stage with Generously Spaced Floating Chevrons */}
      <div className="relative max-w-[1360px] mx-auto w-full px-12 sm:px-16 lg:px-20">
        {/* Left Floating Chevron */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={isFirstPage}
          aria-label="Previous page"
          className={`absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] ${
            isFirstPage
              ? 'bg-[#EAE0CE]/50 border-[#C6B192]/40 text-[#9B856A] cursor-not-allowed opacity-50'
              : 'bg-[#2C1D13]/92 border-[#D8A856]/60 text-[#F8EBD3] shadow-[0_6px_16px_rgba(24,14,8,0.4)] hover:bg-[#8A3B1B] hover:border-[#F2C97D] hover:scale-105 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Measurement Wrapper + Scrollable/Pannable Zoom Viewport */}
        <div ref={stageMeasureRef} onContextMenu={(e) => e.preventDefault()} className="relative w-full">
          <div
            ref={zoomViewportRef}
            onPointerDown={handlePanPointerDown}
            onPointerMove={handlePanPointerMove}
            onPointerUp={handlePanPointerUp}
            onPointerLeave={() => {
              setIsPanning(false);
              panStartRef.current = null;
              setLens((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }}
            className={`relative w-full rounded-lg ${
              zoom > 1
                ? `overflow-auto border ${
                    isFullscreen
                      ? 'max-h-[78vh] border-[#D8A856]/30 bg-black/25'
                      : 'max-h-[68vh] border-[#B89B73]/50 bg-[#E6D6BC]/55'
                  } ${isPanning ? 'cursor-grabbing' : isMagnifierOn ? 'cursor-crosshair' : 'cursor-grab'}`
                : 'overflow-visible'
            }`}
          >
            {/* Sized Spacer ensures zoomed pages scroll & pan cleanly to every corner */}
            <div
              className="mx-auto relative"
              style={{
                width: `${totalBookW * zoom}px`,
                height: `${totalBookH * zoom}px`,
              }}
            >
              <div
                style={{
                  width: `${totalBookW}px`,
                  height: `${totalBookH}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
                className={zoom > 1 || isMagnifierOn ? 'pointer-events-none' : undefined}
              >
                <div
                  ref={mountContainerRef}
                  className="w-full h-full drop-shadow-[0_18px_36px_rgba(20,10,4,0.42)]"
                />
              </div>
            </div>
          </div>

          {/* Interactive Magnifier Pointer Overlay (anchored to non-scrolling stage) */}
          {isMagnifierOn && (
            <div
              onPointerMove={(e) => updateMagnifierFromPointer(e.clientX, e.clientY)}
              onPointerDown={(e) => updateMagnifierFromPointer(e.clientX, e.clientY)}
              onPointerLeave={() => setLens((prev) => ({ ...prev, visible: false }))}
              className="absolute inset-0 z-20 cursor-crosshair touch-none"
              aria-label="Magnifier tracking area"
            />
          )}

          {/* Optical Magnifier Lens (Loupe) */}
          {isMagnifierOn && lens.visible && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-30 rounded-full overflow-hidden border-[3px] border-[#C99A4E] shadow-[0_14px_34px_rgba(10,5,2,0.65),inset_0_0_16px_rgba(0,0,0,0.22)] bg-[#F6EFE2]"
              style={{
                width: `${LENS_SIZE}px`,
                height: `${LENS_SIZE}px`,
                left: `${lens.x - LENS_SIZE / 2}px`,
                top: `${lens.y - LENS_SIZE / 2}px`,
              }}
            >
              <img
                src={lens.imgSrc}
                alt=""
                referrerPolicy="no-referrer"
                className="max-w-none select-none pointer-events-none"
                style={{
                  width: `${lens.scaledW}px`,
                  height: `${lens.scaledH}px`,
                  transform: `translate3d(${lens.offsetX}px, ${lens.offsetY}px, 0)`,
                }}
              />
            </div>
          )}
        </div>

        {/* Right Floating Chevron */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={isLastPage}
          aria-label="Next page"
          className={`absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8A3B1B] ${
            isLastPage
              ? 'bg-[#EAE0CE]/50 border-[#C6B192]/40 text-[#9B856A] cursor-not-allowed opacity-50'
              : 'bg-[#2C1D13]/92 border-[#D8A856]/60 text-[#F8EBD3] shadow-[0_6px_16px_rgba(24,14,8,0.4)] hover:bg-[#8A3B1B] hover:border-[#F2C97D] hover:scale-105 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Synced Horizontal Range Scrubber & Reading Hint */}
      <div className="max-w-2xl mx-auto w-full mt-4 sm:mt-5 px-2">
        <div
          className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-5 border rounded-lg px-4 sm:px-6 py-2.5 shadow-sm ${
            isFullscreen
              ? 'bg-[#2B1D13]/95 border-[#D8A856]/30 text-[#FBF4E6]'
              : 'bg-[#EFE3CE]/85 border-[#B99D78]/45 text-[#2B1B10]'
          }`}
        >
          <label
            htmlFor="page-scrubber"
            className={`flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.12em] font-semibold whitespace-nowrap shrink-0 ${
              isFullscreen ? 'text-[#E6BA72]' : 'text-[#5C3D26]'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <BookOpen className="w-4 h-4 text-[#C26A3D]" aria-hidden="true" />
            <span>Browse</span>
          </label>

          <input
            id="page-scrubber"
            type="range"
            min={0}
            max={Math.max(0, totalPages - 1)}
            step={1}
            value={currentPage}
            onChange={handleScrubChange}
            aria-label={`Jump to page in ${activeBook.tabLabel}`}
            aria-valuetext={`${formatPageLabel()} of ${totalPages}`}
            className="archival-scrubber w-full h-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A3B1B]"
          />

          <div
            className="text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-live="polite"
          >
            {formatPageLabel()}{' '}
            <span className={isFullscreen ? 'text-[#C8B293] font-normal' : 'text-[#78593E] font-normal'}>
              of {totalPages}
            </span>
          </div>
        </div>

        <p
          className={`text-center text-xs sm:text-sm italic mt-2 ${
            isFullscreen ? 'text-[#D6C1A3]' : 'text-[#6B4E35]'
          }`}
        >
          {isMagnifierOn
            ? 'Move cursor or drag across the page to inspect text through the 2.25x magnifier lens.'
            : zoom > 1
            ? 'Drag to pan around the zoomed page, or use the arrows and slider to turn pages.'
            : 'Drag or click a page corner to turn pages, or use Zoom, Magnifier, and Fullscreen above.'}
        </p>
      </div>
    </section>
  );
};
