'use client';

/**
 * @file HeroCarousel.tsx
 * @description Full-width edge-to-edge homepage hero slider.
 * Fetches or accepts active slides from HeroSlide collection.
 * Features auto-advance, manual prev/next controls, dot indicators, and pause-on-hover.
 * Per docs/08-homepage-layout.md section 1.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';

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
 */
export default function HeroCarousel({ slides: initialSlides }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(!initialSlides || initialSlides.length === 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback default slide if no slides exist in database
  const defaultSlides: HeroSlideData[] = [
    {
      _id: 'default-1',
      imageUrl: '/images/hero-banner.jpg',
      headline: 'Heavy Duty Industrial Hardware & Power Tools',
      subheadline: 'Direct factory distributor supplying Northern India’s largest infrastructure projects, fabrication units, and EPC builders.',
      linkUrl: '/products',
      buttonText: 'Explore Wholesale Catalog',
      displayOrder: 0,
    },
    {
      _id: 'default-2',
      imageUrl: '/images/hero-banner.jpg',
      headline: 'Grade 8.8 & 10.9 High-Tensile Structural Fasteners',
      subheadline: 'Certified proof loads with manufacturer 3.1 Mill Test Certificates and bulk contractor crates dispatched daily.',
      linkUrl: '/category/fasteners-fixings',
      buttonText: 'View Fasteners Range',
      displayOrder: 1,
    },
    {
      _id: 'default-3',
      imageUrl: '/images/hero-banner.jpg',
      headline: 'Authorized Bosch Heavy-Duty Tool Center',
      subheadline: 'Rotary hammers, angle grinders, and demolition breakers with manufacturer warranty & genuine spare parts.',
      linkUrl: '/category/hand-power-tools',
      buttonText: 'Browse Bosch Tools',
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

  // Auto-advance timer (5 seconds)
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeSlides.length, handleNext]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section
      className="hero-carousel-root"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        maxHeight: '520px',
        height: '52vw',
        background: '#0F172A',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
      aria-label="Homepage Featured Highlights"
    >
      {/* Background Slides with Fade/Slide Effect */}
      {activeSlides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide._id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isCurrent ? 1 : 0,
              visibility: isCurrent ? 'visible' : 'hidden',
              transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
            }}
          >
            {/* Background Image */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${slide.imageUrl || '/images/hero-banner.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.38) contrast(1.1)',
                transform: isCurrent ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 6s ease-out',
              }}
            />

            {/* Gradient Overlays for readable text */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.65) 55%, rgba(15,23,42,0.2) 100%)',
              }}
            />
          </div>
        );
      })}

      {/* Slide Foreground Content */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          padding: '0 24px',
        }}
      >
        <div style={{ maxWidth: '680px', color: '#FFFFFF' }}>
          {/* Subtle Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(217, 119, 6, 0.22)',
              border: '1px solid rgba(217, 119, 6, 0.45)',
              color: '#FBBF24',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ShieldCheck size={14} />
            <span>Industrial Distribution Hub</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              marginBottom: '14px',
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {currentSlide.headline || 'Heavy Duty Industrial Hardware'}
          </h1>

          {/* Subheadline */}
          {currentSlide.subheadline && (
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                lineHeight: 1.55,
                color: '#E2E8F0',
                marginBottom: '26px',
                maxWidth: '600px',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}
            >
              {currentSlide.subheadline}
            </p>
          )}

          {/* CTA Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href={currentSlide.linkUrl || '/products'}
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.98rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.45)',
              }}
            >
              <span>{currentSlide.buttonText || 'Explore Products'}</span>
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/contact-us"
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#FFFFFF',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: 600,
                backdropFilter: 'blur(6px)',
              }}
            >
              Submit Trade RFQ
            </Link>
          </div>
        </div>
      </div>

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
            bottom: '20px',
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
