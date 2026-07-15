import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { HeroScroll } from "@/components/hero-scroll";
import { RestOfPageBlur } from "@/components/rest-of-page-blur";
import { FleetSection } from "@/components/fleet-section";
import { TeamSection } from "@/components/team-section";
import { ReviewsSection } from "@/components/reviews-section";
import { ContactSection } from "@/components/contact-section";
import { MobileNav } from "@/components/mobile-nav";
import { HashScrollHandler } from "@/components/hash-scroll-handler";

export default function Home() {
  return (
    <main className="relative min-h-screen pb-mobile-nav md:pb-0">
      <HashScrollHandler />
      <PageBackground />
      <RestOfPageBlur />
      <SiteHeader />
      <div className="relative z-[2]">
        <HeroScroll />
        <FleetSection />
        <TeamSection />
        <ReviewsSection />
        <ContactSection />
      </div>
      <MobileNav />
    </main>
  );
}
