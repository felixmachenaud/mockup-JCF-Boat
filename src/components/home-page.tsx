"use client";

import type { SiteContent } from "@/lib/site-content";
import { featuredBoats, publishedReviews, publishedTeam } from "@/lib/boats";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { HeroScroll } from "@/components/hero-scroll";
import { RestOfPageBlur } from "@/components/rest-of-page-blur";
import { PresentationSection } from "@/components/presentation-section";
import { FleetSection } from "@/components/fleet-section";
import { DestinationsSection } from "@/components/destinations-section";
import { TeamSection } from "@/components/team-section";
import { ReviewsSection } from "@/components/reviews-section";
import { ContactSection } from "@/components/contact-section";
import { MobileNav } from "@/components/mobile-nav";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export function HomePage({ content }: { content: SiteContent }) {
  const boats = featuredBoats(content.boats);
  const reviews = publishedReviews(content.reviews.items);
  const members = publishedTeam(content.team.members);
  const headerProps = {
    brandName: content.brand.name,
    phone: content.contact.phone,
    phoneDisplay: content.contact.phoneDisplay,
  };

  return (
    <main className="relative min-h-[100svh] pb-mobile-nav md:min-h-screen md:pb-0">
      <HashScrollHandler />
      <PageBackground />
      <RestOfPageBlur />
      <SiteHeader {...headerProps} />
      <div className="relative z-[2]">
        <HeroScroll
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          ctaLabel={content.hero.ctaLabel}
          secondaryCtaLabel={content.hero.secondaryCtaLabel}
          brandName={content.brand.name}
        />
        <PresentationSection content={content.presentation} />
        <FleetSection
          boats={boats}
          eyebrow={content.fleet.eyebrow}
          title={content.fleet.title}
          subtitle={content.fleet.subtitle}
          viewAllLabel={content.fleet.viewAllLabel}
        />
        <DestinationsSection
          content={content.destinations}
          locationTitle={content.pages.location.title}
          locationEyebrow={content.pages.location.eyebrow}
          locationBlurb={content.pages.location.subtitle}
          calanquesTitle={content.pages.calanques.title}
          calanquesEyebrow={content.pages.calanques.eyebrow}
          calanquesBlurb={content.pages.calanques.subtitle}
        />
        <TeamSection
          eyebrow={content.team.eyebrow}
          title={content.team.title}
          subtitle={content.team.subtitle}
          ctaLabel={content.team.ctaLabel}
          image={content.team.image}
          members={members}
          phoneDisplay={content.contact.phoneDisplay}
        />
        <ReviewsSection
          eyebrow={content.reviews.eyebrow}
          title={content.reviews.title}
          subtitle={content.reviews.subtitle}
          ctaLabel={content.reviews.ctaLabel}
          reviews={reviews}
        />
        <ContactSection contact={content.contact} />
      </div>
      <MobileNav />
    </main>
  );
}
