"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  reviewCategories,
  reviewCategoryLabels,
  type ReviewCategory,
} from "@/lib/mock-reviews";
import type { CmsReview } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ReviewCard({
  name,
  location,
  rating,
  text,
  date,
  categoryLabel,
}: {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  categoryLabel: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/12 bg-black/25 p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white/65 uppercase">
          {categoryLabel}
        </span>
      </div>

      <blockquote className="flex-1 text-sm leading-relaxed text-white/90 md:text-base">
        &ldquo;{text}&rdquo;
      </blockquote>

      <footer className="mt-4 border-t border-white/10 pt-4">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-white/55">
          {location} · {date}
        </p>
      </footer>
    </article>
  );
}

type ReviewsSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  reviews: CmsReview[];
};

export function ReviewsSection({
  eyebrow = "Avis",
  title = "Ce que disent nos clients",
  subtitle,
  ctaLabel = "Nous contacter",
  reviews: allReviews,
}: ReviewsSectionProps) {
  const [category, setCategory] = useState<ReviewCategory>("all");
  const [index, setIndex] = useState(0);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reviews = useMemo(() => {
    if (category === "all") return allReviews;
    return allReviews.filter((review) => review.category === category);
  }, [category, allReviews]);

  const visibleCount =
    category === "all" || compact ? 1 : Math.min(3, reviews.length);
  const maxIndex = Math.max(0, reviews.length - visibleCount);

  const visibleReviews = useMemo(() => {
    if (category === "all") {
      return [reviews[index % reviews.length]].filter(Boolean);
    }
    return reviews.slice(index, index + visibleCount);
  }, [category, reviews, index, visibleCount]);

  const goTo = (direction: -1 | 1) => {
    setIndex((prev) => {
      const step = category === "all" ? 1 : visibleCount;
      const next = prev + direction * step;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
  };

  const handleCategoryChange = (id: ReviewCategory) => {
    setCategory(id);
    setIndex(0);
  };

  if (allReviews.length === 0) return null;

  return (
    <section id="reviews" className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{subtitle}</p>
          )}
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {reviewCategories.map(({ id, label }) => {
            const count =
              id === "all"
                ? allReviews.length
                : allReviews.filter((r) => r.category === id).length;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleCategoryChange(id)}
                className={cn(
                  "min-h-11 rounded-full px-4 py-2.5 text-xs font-medium transition-colors active:scale-[0.98] md:text-sm",
                  category === id
                    ? "bg-white text-slate-900"
                    : "border border-white/25 text-white/80 hover:border-white/40 hover:text-white",
                )}
              >
                {label}
                <span className="ml-1.5 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${category}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={cn(
                "grid gap-4",
                category === "all" ? "mx-auto max-w-3xl" : "md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  name={review.name}
                  location={review.location}
                  rating={review.rating}
                  text={review.text}
                  date={review.date}
                  categoryLabel={reviewCategoryLabels[review.category]}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {reviews.length > visibleCount && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Avis précédents"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm text-white/50">
                {Math.floor(index / visibleCount) + 1} /{" "}
                {Math.ceil(reviews.length / visibleCount)}
              </p>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Avis suivants"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {category === "all" && (
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {reviewCategories.slice(1).map(({ id, label }) => {
              const categoryReviews = allReviews.filter((r) => r.category === id);
              const featured = categoryReviews[0];
              if (!featured) return null;

              return (
                <div key={id}>
                  <h3 className="mb-3 text-xs font-medium tracking-[0.2em] text-sky-300 uppercase">
                    {label}
                  </h3>
                  <ReviewCard
                    name={featured.name}
                    location={featured.location}
                    rating={featured.rating}
                    text={featured.text}
                    date={featured.date}
                    categoryLabel={reviewCategoryLabels[featured.category]}
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-white/90">
            <Link href="/#contact">{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
