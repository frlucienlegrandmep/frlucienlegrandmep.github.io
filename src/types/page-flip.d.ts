declare module 'page-flip' {
  export interface PageFlipSettings {
    startPage?: number;
    size?: 'fixed' | 'stretch';
    width: number;
    height: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface PageFlipEvent<T = unknown> {
    data: T;
    object: PageFlip;
  }

  export interface PageFlipRender {
    finishAnimation(): void;
  }

  export class PageFlip {
    constructor(htmlParentElement: HTMLElement, settings: PageFlipSettings);
    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    update(): void;
    clear(): void;
    destroy(): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    getState(): 'user_fold' | 'fold_corner' | 'flipping' | 'read';
    getRender(): PageFlipRender;
    on(eventName: 'flip', callback: (e: PageFlipEvent<number>) => void): void;
    on(eventName: 'changeOrientation', callback: (e: PageFlipEvent<'portrait' | 'landscape'>) => void): void;
    on(eventName: 'changeState', callback: (e: PageFlipEvent<string>) => void): void;
    on(
      eventName: 'init' | 'update',
      callback: (e: PageFlipEvent<{ page: number; mode: 'portrait' | 'landscape' }>) => void
    ): void;
  }
}
