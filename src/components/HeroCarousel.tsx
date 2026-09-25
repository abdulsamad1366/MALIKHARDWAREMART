'use client';

/**
 * @file HeroCarousel.tsx
 * @description Full-width edge-to-edge homepage hero image slider.
 * Clean, image-only carousel without text overlays per user instruction.
 * Features GSAP transitions, auto-advance, manual prev/next controls,
 * dot indicators, pause-on-hover, and mobile touch swipe.
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

/**
 * HeroCarousel Component.
 * Image-only banner slider with GSAP transitions and touch support.
 */
export default function HeroCarousel({ slides: initialSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(!initialSlides || initialSlides.length === 0);
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

  // Fallback default slides if no slides exist in database
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

  // Fetch active hero slides from API if not provided in props
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
      setLoading(false);
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
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, [initialSlides]);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Next slide handler
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  // Previous slide handler
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // GSAP transition when currentIndex changes
  useEffect(() => {
    if (reducedMotion) return;

    // Animate active slide opacity
    const currentSlideEl = slideRefs.current[currentIndex];
    if (currentSlideEl) {
      gsap.fromTo(
        currentSlideEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [currentIndex, reducedMotion]);

  // Auto-advance timer (5.5 seconds) - disabled if reducedMotion is true or paused
  useEffect(() => {
    if (reducedMotion || isPaused || activeSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reducedMotion, isPaused, activeSlides.length, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(); // Swiped left -> next
      } else {
        handlePrev(); // Swiped right -> prev
      }
    }
  };

  return (
    <section
      className="hero-carousel-root"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(380px, 50vw, 680px)',
        background: '#0F172A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
      aria-label="Homepage Featured Highlights"
    >
      {/* Background Slides with Fade Effect */}
      {activeSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide._id}
            ref={(el) => {
              slideRefs.current[idx] = el;
            }}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isCurrent ? 1 : 0,
              visibility: isCurrent ? 'visible' : 'hidden',
              transition: reducedMotion ? 'none' : 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
            }}
          >
            <Link
              href={slide.linkUrl || '/products'}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                position: 'relative',
                textDecoration: 'none',
              }}
              aria-label={slide.headline || `Promotion slide ${idx + 1}`}
            >
              {/* Clean Image Only — No Text Overlays */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${slide.imageUrl || '/images/hero-banner.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: !reducedMotion && isCurrent ? 'scale(1.02)' : 'scale(1)',
                  transition: reducedMotion ? 'none' : 'transform 6s ease-out',
                }}
              />
            </Link>
          </div>
        );
      })}

      {/* Manual Prev / Next Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background var(--transition-fast), transform var(--transition-fast)',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(217, 119, 6, 0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background var(--transition-fast), transform var(--transition-fast)',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(217, 119, 6, 0.85)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Slide Navigation Dots */}
      {activeSlides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? '28px' : '10px',
                height: '10px',
                borderRadius: 'var(--radius-full)',
                background: idx === currentIndex ? 'var(--color-amber)' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
