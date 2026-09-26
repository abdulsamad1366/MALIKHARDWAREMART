'use client';

/**
 * @file HeroCarousel.tsx
 * @description Full-width edge-to-edge homepage hero image slider.
 * Clean, image-only carousel with Apple & Google aesthetic, Tailwind CSS, and GSAP transitions.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export interface HeroSlideData {
  _id: string;
  imageUrl: string;
  headline?: string;
  subheadline?: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
}

interface HeroCarouselProps {
  slides?: HeroSlideData[];
}

export default function HeroCarousel({ slides: initialSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartX = useRef<number>(0);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const defaultSlides: HeroSlideData[] = [
    {
      _id: 'default-1',
      imageUrl: '/images/hero-banner.jpg',
      linkUrl: '/products',
      displayOrder: 0,
    },
    {
      _id: 'default-2',
      imageUrl: '/images/hero-banner.jpg',
      linkUrl: '/category/fasteners-fixings',
      displayOrder: 1,
    },
    {
      _id: 'default-3',
      imageUrl: '/images/hero-banner.jpg',
      linkUrl: '/category/hand-power-tools',
      displayOrder: 2,
    },
  ];

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
      return;
    }

    async function fetchSlides() {
      try {
        const res = await fetch('/api/hero-slides');
        if (res.ok) {
          const data = await res.json();
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides);
          } else {
            setSlides(defaultSlides);
          }
        } else {
          setSlides(defaultSlides);
        }
      } catch (err) {
        console.error('Failed to fetch hero slides:', err);
        setSlides(defaultSlides);
      }
    }

    fetchSlides();
  }, [initialSlides]);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // GSAP transition when currentIndex changes
  useEffect(() => {
    if (reducedMotion) return;

    const currentSlideEl = slideRefs.current[currentIndex];
    if (currentSlideEl) {
      gsap.fromTo(
        currentSlideEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.55, ease: 'power2.out' }
      );
    }
  }, [currentIndex, reducedMotion]);

  // Auto-advance timer (5.5 seconds)
  useEffect(() => {
    if (reducedMotion || isPaused || activeSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, isPaused, activeSlides.length, handleNext]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section
      className="relative w-full h-[clamp(380px,50vw,680px)] bg-slate-950 overflow-hidden flex items-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Homepage Featured Highlights"
    >
      {/* Background Slides */}
      {activeSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide._id}
            ref={(el) => {
              slideRefs.current[idx] = el;
            }}
            className={`absolute inset-0 transition-opacity duration-700 ease-out z-[1] ${
              isCurrent ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <Link
              href={slide.linkUrl || '/products'}
              className="block w-full h-full relative"
              aria-label={slide.headline || `Promotion slide ${idx + 1}`}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-6000 ease-out ${
                  !reducedMotion && isCurrent ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  backgroundImage: `url(${slide.imageUrl || '/images/hero-banner.jpg'})`,
                }}
              />
            </Link>
          </div>
        );
      })}

      {/* Prev / Next Controls */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Slide Navigation Capsule Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 shadow-md">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-red-500 shadow-sm'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
