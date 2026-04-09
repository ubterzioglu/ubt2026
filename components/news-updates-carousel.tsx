"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import Image, { type ImageLoaderProps } from "next/image";

import type { NewsUpdateItem } from "@/types/site";

interface NewsUpdatesCarouselProps {
  items: NewsUpdateItem[];
}

const newsImageLoader = ({ src }: ImageLoaderProps) => src;

export function NewsUpdatesCarousel({ items }: NewsUpdatesCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || items.length <= 1 || isPaused) {
      return;
    }

    let frameId = 0;
    let lastTime = 0;

    const tick = (time: number) => {
      if (!viewportRef.current) {
        return;
      }

      if (lastTime === 0) {
        lastTime = time;
      }

      const halfWidth = viewport.scrollWidth / 2;
      const delta = time - lastTime;
      lastTime = time;
      viewport.scrollLeft += delta * 0.03;

      if (viewport.scrollLeft >= halfWidth) {
        viewport.scrollLeft -= halfWidth;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isPaused, items.length]);

  const loopItems = items.length > 1 ? [...items, ...items] : items;

  const scrollByCard = (direction: "prev" | "next") => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const firstCard = viewport.querySelector<HTMLElement>("[data-news-card='true']");
    const halfWidth = viewport.scrollWidth / 2;
    const cardWidth = firstCard?.offsetWidth ?? viewport.clientWidth * 0.88;
    const gap = 16;

    if (direction === "prev" && viewport.scrollLeft <= 4) {
      viewport.scrollLeft += halfWidth;
    }

    if (
      direction === "next" &&
      viewport.scrollLeft >= halfWidth - viewport.clientWidth - 4
    ) {
      viewport.scrollLeft -= halfWidth;
    }

    viewport.scrollBy({
      left: direction === "next" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth"
    });
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
        scrollByCard("prev");
      } else if (delta < -45) {
        scrollByCard("next");
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
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-paper via-paper/65 to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-paper via-paper/65 to-transparent sm:w-14" />

      <div
        ref={viewportRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex gap-4 pr-4">
          {loopItems.map((item, index) => {
            const card = (
              <>
                <div
                  className={`relative aspect-[1.48] overflow-hidden ${
                    item.detailHref ? "" : "rounded-t-[1.45rem] sm:rounded-t-[1.6rem]"
                  }`}
                >
                  {item.imageUrl ? (
                    <Image
                      loader={newsImageLoader}
                      unoptimized
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 24rem, (min-width: 768px) 22rem, 86vw"
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
              "group w-[86vw] shrink-0 overflow-hidden rounded-[1.45rem] border border-line/80 bg-white/82 shadow-sm transition hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:w-[22rem] sm:rounded-[1.6rem] xl:w-[24rem]";

            return item.detailHref ? (
              <a
                key={`${item.id}-${index}`}
                href={item.detailHref}
                className={className}
                data-news-card="true"
              >
                {card}
              </a>
            ) : (
              <article
                key={`${item.id}-${index}`}
                className={className}
                data-news-card="true"
              >
                {card}
              </article>
            );
          })}
        </div>
      </div>

      {items.length > 1 ? (
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollByCard("prev")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line/80 bg-gradient-to-b from-white to-mist/80 text-ink shadow-[0_14px_28px_rgba(20,31,39,0.12)] transition hover:-translate-y-0.5 hover:border-accent/35 hover:text-accent hover:shadow-[0_18px_34px_rgba(27,122,110,0.18)] sm:h-12 sm:w-12"
            aria-label="Previous news update"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current stroke-[1.9]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 5.5 8 12l6.5 6.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard("next")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line/80 bg-gradient-to-b from-white to-mist/80 text-ink shadow-[0_14px_28px_rgba(20,31,39,0.12)] transition hover:-translate-y-0.5 hover:border-accent/35 hover:text-accent hover:shadow-[0_18px_34px_rgba(27,122,110,0.18)] sm:h-12 sm:w-12"
            aria-label="Next news update"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current stroke-[1.9]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 5.5 16 12l-6.5 6.5" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
