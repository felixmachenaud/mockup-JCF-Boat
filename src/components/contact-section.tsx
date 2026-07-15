import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <section id="contact" className="relative scroll-mt-28 px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/15 bg-black/30 p-6 md:p-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
              Contact
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Prêt à prendre le large ?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              Notre équipe vous répond 7j/7 pour organiser votre journée en mer à Cassis.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href="tel:0675742581"
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white transition-colors active:bg-white/5 hover:border-white/25"
            >
              <Phone className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Téléphone</p>
                <p className="font-medium">06 75 74 25 81</p>
              </div>
            </a>

            <a
              href="mailto:contact@jcfboat.fr"
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white transition-colors active:bg-white/5 hover:border-white/25"
            >
              <Mail className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Email</p>
                <p className="font-medium">contact@jcfboat.fr</p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white">
              <MapPin className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Base</p>
                <p className="font-medium">Port de Cassis, 13260</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-white">
              <Clock className="h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <p className="text-xs text-white/60">Horaires</p>
                <p className="font-medium">8h – 20h · Avril à Octobre</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/reservation">Réserver en ligne</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
            >
              <a href="tel:0675742581">Appeler maintenant</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
