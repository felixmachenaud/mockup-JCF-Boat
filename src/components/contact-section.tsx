import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactMessageForm } from "@/components/contact-message-form";
import type { SiteContent } from "@/lib/site-content";

type ContactSectionProps = {
  contact: SiteContent["contact"];
};

export function ContactSection({ contact }: ContactSectionProps) {
  return (
    <section id="contact" className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/15 bg-black/30 p-6 md:p-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
              {contact.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {contact.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              {contact.subtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:${contact.phone}`}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white transition-colors hover:border-white/25 active:bg-white/5"
            >
              <Phone className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Téléphone</p>
                <p className="font-medium">{contact.phoneDisplay}</p>
              </div>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white transition-colors hover:border-white/25 active:bg-white/5"
            >
              <Mail className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Email</p>
                <p className="font-medium">{contact.email}</p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white">
              <MapPin className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Base</p>
                <p className="font-medium">{contact.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white">
              <Clock className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Horaires</p>
                <p className="font-medium">{contact.hours}</p>
              </div>
            </div>
          </div>

          <ContactMessageForm />

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={`tel:${contact.phone}`}>{contact.ctaCallLabel}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              <Link href="/bateaux">Voir les bateaux</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
