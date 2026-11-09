import React, { useState, useEffect } from 'react';
import { HeroSlide, PageRoute } from '../types';
import { ChevronLeft, ChevronRight, ArrowUpRight, CheckCircle2, Shield } from 'lucide-react';

interface HeroCarouselProps {
  slides: HeroSlide[];
  onNavigate: (page: PageRoute) => void;
  onOpenQuoteModal?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  slides, 
  onNavigate,
  onOpenQuoteModal,
}) => {
  const activeSlides = slides.filter((s) => s.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section 
      className="relative w-full h-[620px] lg:h-[720px] overflow-hidden bg-slate-900 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured Business Setup Highlights"
    >
      {/* Background Slides with smooth fade */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform scale-102 transition-transform duration-7000 ease-out"
            referrerPolicy="no-referrer"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          {/* Measured Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#000833]/92 via-[#000833]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000833]/80 via-transparent to-black/20" />
        </div>
      ))}

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          
          {/* Kicker badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#f85508]" />
            <span>{currentSlide.badgeText}</span>
            <span aria-hidden="true">·</span>
            <span className="text-orange-300 font-semibold">{currentSlide.highlightText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] text-balance">
            {currentSlide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-200/90 leading-relaxed font-normal max-w-2xl">
            {currentSlide.subtitle}
          </p>

          {/* Key Value Prop List */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f85508] shrink-0" />
              <span>100% Foreign Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f85508] shrink-0" />
              <span>Itemized Written Quotes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f85508] shrink-0" />
              <span>Dedicated PRO Concierge</span>
            </div>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate(currentSlide.ctaAction)}
              className="neo-btn-orange px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/20"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenQuoteModal ? onOpenQuoteModal : () => onNavigate('contact')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{currentSlide.secondaryCtaText}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tactile Neomorphic Carousel Navigation Controls */}
      <div className="absolute z-30 bottom-8 right-6 sm:right-12 flex items-center gap-3">
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="w-11 h-11 rounded-xl bg-[#f0f4f8]/80 hover:bg-white text-[#00106b] shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-[#f85508]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="w-11 h-11 rounded-xl bg-[#f0f4f8]/80 hover:bg-white text-[#00106b] shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
