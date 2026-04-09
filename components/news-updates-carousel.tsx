"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import Image, { type ImageLoaderProps } from "next/image";

import type { NewsUpdateItem } from "@/types/site";

interface NewsUpdatesCarouselProps {
  items: NewsUpdateItem[];
}

const newsImageLoader = ({ src }: ImageLoaderProps) => src;

function getVisibleSlides(width: number) {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
}

function chunkItems(items: NewsUpdateItem[], size: number) {
  const pages: NewsUpdateItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}

export function NewsUpdatesCarousel({ items }: NewsUpdatesCarouselProps) {
  const [visibleSlides, setVisibleSlides] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => {
      setVisibleSlides(getVisibleSlides(window.innerWidth));
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pages = useMemo(
    () => chunkItems(items, visibleSlides),
    [items, visibleSlides]
  );

  useEffect(() => {
    if (activePage >= pages.length) {
      setActivePage(0);
    }
  }, [activePage, pages.length]);

  useEffect(() => {
    if (pages.length <= 1 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActivePage((current) => (current + 1) % pages.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isPaused, pages.length]);

  const goPrev = () => {
    setActivePage((current) => (current - 1 + pages.length) % pages.length);
  };

  const goNext = () => {
    setActivePage((current) => (current + 1) % pages.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    if (startX !== null && endX !== null) {
      const delta = endX - startX;

      if (delta > 45) {
        goPrev();
      } else if (delta < -45) {
        goNext();
      }
    }

    touchStartX.current = null;
    setIsPaused(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
          Short updates from current builds, portfolio changes, and practical QA-related work in
          progress.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-white/85 text-ink shadow-sm transition hover:border-accent/35 hover:text-accent sm:h-11 sm:w-11"
            aria-label="Previous news update"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/80 bg-white/85 text-ink shadow-sm transition hover:border-accent/35 hover:text-accent sm:h-11 sm:w-11"
            aria-label="Next news update"
          >
            →
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={`news-page-${pageIndex + 1}`}
              className="grid min-w-full gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {page.map((item) => {
                const card = (
                  <>
                    <div
                      className={`relative aspect-[1.5] overflow-hidden ${
                        item.detailHref ? "" : "rounded-[1.45rem] sm:rounded-[1.6rem]"
                      }`}
                    >
                      {item.imageUrl ? (
                        <Image
                          loader={newsImageLoader}
                          unoptimized
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/18 via-accentSoft/50 to-sunrise/18" />
                      )}
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="font-body text-[clamp(1.2rem,4vw,1.55rem)] font-semibold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-ink/72 sm:text-base">
                        {item.summary}
                      </p>
                      {item.detailHref ? (
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                          Details <span aria-hidden="true">↗</span>
                        </span>
                      ) : null}
                    </div>
                  </>
                );

                const className =
                  "group overflow-hidden rounded-[1.45rem] border border-line/80 bg-white/82 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem]";

                return item.detailHref ? (
                  <a
                    key={item.id}
                    href={item.detailHref}
                    className={className}
                  >
                    {card}
                  </a>
                ) : (
                  <article key={item.id} className={className}>
                    {card}
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={`news-dot-${index + 1}`}
              type="button"
              onClick={() => setActivePage(index)}
              className={`h-2.5 rounded-full transition ${
                index === activePage ? "w-8 bg-accent" : "w-2.5 bg-line/90"
              }`}
              aria-label={`Go to news page ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
