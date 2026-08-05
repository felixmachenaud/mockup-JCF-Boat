"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  emptyBoat,
  emptyCalanque,
  emptyReview,
  emptyTeamMember,
  slugify,
  type BoatCategory,
  type CmsBoat,
  type CmsCalanque,
  type CmsHighlight,
  type CmsPriceRow,
  type CmsReview,
  type CmsTeamMember,
  type DestinationPageContent,
  type SiteContent,
} from "@/lib/site-content";

const TABS = [
  { key: "accueil", label: "Accueil" },
  { key: "bateaux", label: "Bateaux" },
  { key: "location", label: "Location Cassis" },
  { key: "calanques", label: "Calanques" },
  { key: "equipe", label: "Équipe" },
  { key: "avis", label: "Avis" },
  { key: "reglages", label: "Réglages" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type EditorProps = {
  initialContent: SiteContent;
  storeMode: "blob" | "local";
};

const inputCls =
  "mt-1.5 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
const selectCls =
  "mt-1.5 h-10 w-full rounded-lg border border-sky-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400";
const labelCls = "block text-xs font-medium text-slate-600";
const dashedBtnCls =
  "rounded-lg border border-dashed border-sky-300 px-3 py-2 text-xs text-sky-700 hover:bg-sky-50 disabled:opacity-50";

const BOAT_CATEGORIES: { value: BoatCategory; label: string }[] = [
  { value: "standard", label: "Avec permis" },
  { value: "sans-permis", label: "Sans permis" },
  { value: "electrique", label: "Électrique" },
];

function emptyHighlight(): CmsHighlight {
  return { id: `h-${Date.now()}`, title: "", text: "" };
}

export default function Editor({ initialContent, storeMode }: EditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [tab, setTab] = useState<TabKey>("accueil");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err" | "warn";
    text: string;
  } | null>(null);
  const [boatIndex, setBoatIndex] = useState(0);

  function patch<K extends keyof SiteContent>(
    key: K,
    next: Partial<SiteContent[K]>,
  ) {
    setContent((c) => ({
      ...c,
      [key]: { ...(c[key] as object), ...next },
    }));
  }

  function patchPage(
    key: keyof SiteContent["pages"],
    next: Partial<DestinationPageContent>,
  ) {
    setContent((c) => ({
      ...c,
      pages: {
        ...c.pages,
        [key]: { ...c.pages[key], ...next },
      },
    }));
  }

  async function onSave() {
    setBusy(true);
    setMessage(null);
    try {
      const emptyCal = content.calanques.find((c) => c.images.length === 0);
      if (emptyCal) {
        setMessage({
          type: "warn",
          text: `« ${emptyCal.name} » n'a pas de photo — ajoutez-en au moins une avant d'enregistrer.`,
        });
        setBusy(false);
        return;
      }

      const slugs = content.boats.map((b) => b.slug);
      if (new Set(slugs).size !== slugs.length) {
        setMessage({
          type: "err",
          text: "Deux bateaux ont le même slug URL — rendez-les uniques.",
        });
        setBusy(false);
        return;
      }

      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(content),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "err", text: j.error || "Échec de la sauvegarde" });
        return;
      }
      setMessage({ type: "ok", text: "Contenu enregistré et site mis à jour." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Erreur réseau",
      });
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jcf-boat-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeBoat = content.boats[boatIndex] ?? content.boats[0];
  const boatIdHint = content.boats
    .map((b) => `${b.id} → ${b.name}`)
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      {storeMode === "local" && (
        <Banner type="warn">
          Stockage local (<code>data/site-content.json</code>). Sur Vercel,
          connectez un Blob store pour la production.
        </Banner>
      )}

      <nav className="mb-6 flex flex-wrap gap-1 border-b border-sky-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white"
                : "rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-sky-50 hover:text-sky-800"
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "accueil" && (
        <div className="space-y-8">
          <Section title="Hero" hint="Premier écran de la page d'accueil">
            <Field
              label="Titre au-dessus du logo"
              value={content.hero.title}
              onChange={(v) => patch("hero", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.hero.subtitle}
              onChange={(v) => patch("hero", { subtitle: v })}
              textarea
            />
            <TwoCol>
              <Field
                label="CTA principal (lien #contact)"
                value={content.hero.ctaLabel}
                onChange={(v) => patch("hero", { ctaLabel: v })}
              />
              <Field
                label="CTA secondaire (lien /bateaux)"
                value={content.hero.secondaryCtaLabel}
                onChange={(v) => patch("hero", { secondaryCtaLabel: v })}
              />
            </TwoCol>
          </Section>

          <Section title="Présentation" hint="Section #presentation sur l'accueil">
            <Field
              label="Sur-titre"
              value={content.presentation.eyebrow}
              onChange={(v) => patch("presentation", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={content.presentation.title}
              onChange={(v) => patch("presentation", { title: v })}
            />
            <Field
              label="Texte"
              value={content.presentation.text}
              onChange={(v) => patch("presentation", { text: v })}
              textarea
            />
            <ImageField
              label="Image"
              value={content.presentation.image}
              onChange={(url) => patch("presentation", { image: url })}
            />
            <Subhead>Points forts</Subhead>
            <ArrayEditor
              items={content.presentation.highlights}
              onChange={(highlights) => patch("presentation", { highlights })}
              addLabel="+ Ajouter un point fort"
              emptyValue={emptyHighlight()}
              renderItem={(item, onChange) => (
                <div className="space-y-3">
                  <Field
                    label="Titre"
                    value={item.title}
                    onChange={(v) => onChange({ ...item, title: v })}
                  />
                  <Field
                    label="Texte"
                    value={item.text}
                    onChange={(v) => onChange({ ...item, text: v })}
                    textarea
                  />
                </div>
              )}
            />
          </Section>

          <Section title="Flotte (en-tête)" hint="Bloc #fleet sur l'accueil">
            <Field
              label="Sur-titre"
              value={content.fleet.eyebrow}
              onChange={(v) => patch("fleet", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={content.fleet.title}
              onChange={(v) => patch("fleet", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.fleet.subtitle}
              onChange={(v) => patch("fleet", { subtitle: v })}
              textarea
            />
            <Field
              label="Libellé « Voir tous les bateaux »"
              value={content.fleet.viewAllLabel}
              onChange={(v) => patch("fleet", { viewAllLabel: v })}
            />
          </Section>

          <Section title="Destinations (en-tête)" hint="Bloc liens vers les pages pilier">
            <Field
              label="Sur-titre"
              value={content.destinations.eyebrow}
              onChange={(v) => patch("destinations", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={content.destinations.title}
              onChange={(v) => patch("destinations", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.destinations.subtitle}
              onChange={(v) => patch("destinations", { subtitle: v })}
              textarea
            />
          </Section>
        </div>
      )}

      {tab === "bateaux" && (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
              Flotte ({content.boats.length})
            </p>
            <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
              {content.boats.map((boat, i) => (
                <button
                  key={boat.id}
                  type="button"
                  onClick={() => setBoatIndex(i)}
                  className={
                    i === boatIndex
                      ? "block w-full rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-left text-sm font-medium text-sky-900"
                      : "block w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm text-slate-600 hover:border-sky-200 hover:bg-sky-50"
                  }
                >
                  <span className="line-clamp-1">{boat.name}</span>
                  <span className="mt-0.5 block text-[10px] opacity-60">
                    {boat.published ? boat.category : `${boat.category} · masqué`}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`mt-3 w-full py-2 text-sm ${dashedBtnCls}`}
              onClick={() => {
                const boat = emptyBoat();
                setContent((c) => ({ ...c, boats: [...c.boats, boat] }));
                setBoatIndex(content.boats.length);
              }}
            >
              + Ajouter un bateau
            </button>
          </aside>

          {activeBoat && (
            <BoatEditor
              boat={activeBoat}
              onChange={(boat) => {
                setContent((c) => ({
                  ...c,
                  boats: c.boats.map((b, i) => (i === boatIndex ? boat : b)),
                }));
              }}
              onDelete={() => {
                if (content.boats.length <= 1) {
                  setMessage({
                    type: "err",
                    text: "Conservez au moins un bateau.",
                  });
                  return;
                }
                if (!confirm(`Supprimer « ${activeBoat.name} » ?`)) return;
                setContent((c) => ({
                  ...c,
                  boats: c.boats.filter((_, i) => i !== boatIndex),
                }));
                setBoatIndex(Math.max(0, boatIndex - 1));
              }}
            />
          )}
        </div>
      )}

      {tab === "location" && (
        <DestinationPageEditor
          title="Location de bateau à Cassis"
          hint="Page /location-bateau-cassis — contenu éditorial et SEO"
          page={content.pages.location}
          onChange={(next) => patchPage("location", next)}
          boatIdHint={boatIdHint}
        />
      )}

      {tab === "calanques" && (
        <div className="space-y-8">
          <DestinationPageEditor
            title="Page Calanques"
            hint="Page /calanques-de-cassis — contenu éditorial et SEO"
            page={content.pages.calanques}
            onChange={(next) => patchPage("calanques", next)}
            boatIdHint={boatIdHint}
          />

          <Section
            title="Fiches calanques"
            hint="Chaque calanque doit avoir au moins une photo avant enregistrement"
          >
            <ArrayEditor
              items={content.calanques}
              onChange={(items) => setContent((c) => ({ ...c, calanques: items }))}
              addLabel="+ Ajouter une calanque"
              emptyValue={emptyCalanque()}
              renderItem={(item, onChange) => (
                <CalanqueEditor item={item} onChange={onChange} />
              )}
            />
          </Section>
        </div>
      )}

      {tab === "equipe" && (
        <div className="space-y-8">
          <Section title="Équipe — en-tête" hint="Section #team sur l'accueil">
            <Field
              label="Sur-titre"
              value={content.team.eyebrow}
              onChange={(v) => patch("team", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={content.team.title}
              onChange={(v) => patch("team", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.team.subtitle}
              onChange={(v) => patch("team", { subtitle: v })}
              textarea
            />
            <Field
              label="Libellé CTA"
              value={content.team.ctaLabel}
              onChange={(v) => patch("team", { ctaLabel: v })}
            />
            <ImageField
              label="Image de section"
              value={content.team.image}
              onChange={(url) => patch("team", { image: url })}
            />
          </Section>

          <Section title="Membres" hint="Cartes affichées dans la section équipe">
            <ArrayEditor
              items={content.team.members}
              onChange={(members) => patch("team", { members })}
              addLabel="+ Ajouter un membre"
              emptyValue={emptyTeamMember()}
              renderItem={(item, onChange) => (
                <TeamMemberEditor item={item} onChange={onChange} />
              )}
            />
          </Section>
        </div>
      )}

      {tab === "avis" && (
        <div className="space-y-8">
          <Section title="Avis — en-tête" hint="Titres de la section avis">
            <Field
              label="Sur-titre"
              value={content.reviews.eyebrow}
              onChange={(v) => patch("reviews", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={content.reviews.title}
              onChange={(v) => patch("reviews", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.reviews.subtitle}
              onChange={(v) => patch("reviews", { subtitle: v })}
              textarea
            />
            <Field
              label="Libellé CTA"
              value={content.reviews.ctaLabel}
              onChange={(v) => patch("reviews", { ctaLabel: v })}
            />
          </Section>

          <Section title="Avis clients" hint="Liste libre — ajout / suppression">
            <ArrayEditor
              items={content.reviews.items}
              onChange={(items) => patch("reviews", { items })}
              addLabel="+ Ajouter un avis"
              emptyValue={emptyReview()}
              renderItem={(item, onChange) => (
                <ReviewEditor item={item} onChange={onChange} />
              )}
            />
          </Section>
        </div>
      )}

      {tab === "reglages" && (
        <div className="space-y-8">
          <Section title="Marque" hint="Nom affiché et signature">
            <TwoCol>
              <Field
                label="Nom de la marque"
                value={content.brand.name}
                onChange={(v) => patch("brand", { name: v })}
              />
              <Field
                label="Tagline"
                value={content.brand.tagline}
                onChange={(v) => patch("brand", { tagline: v })}
              />
            </TwoCol>
          </Section>

          <Section title="Contact" hint="Coordonnées affichées sur le site">
            <Field
              label="Sur-titre"
              value={content.contact.eyebrow}
              onChange={(v) => patch("contact", { eyebrow: v })}
            />
            <Field
              label="Titre section"
              value={content.contact.title}
              onChange={(v) => patch("contact", { title: v })}
            />
            <Field
              label="Sous-titre"
              value={content.contact.subtitle}
              onChange={(v) => patch("contact", { subtitle: v })}
              textarea
            />
            <TwoCol>
              <Field
                label="Téléphone (affichage)"
                value={content.contact.phoneDisplay}
                onChange={(v) => patch("contact", { phoneDisplay: v })}
              />
              <Field
                label="Téléphone (lien tel:)"
                value={content.contact.phone}
                onChange={(v) => patch("contact", { phone: v })}
              />
            </TwoCol>
            <TwoCol>
              <Field
                label="Email"
                value={content.contact.email}
                onChange={(v) => patch("contact", { email: v })}
              />
              <Field
                label="Adresse"
                value={content.contact.address}
                onChange={(v) => patch("contact", { address: v })}
              />
            </TwoCol>
            <Field
              label="Horaires"
              value={content.contact.hours}
              onChange={(v) => patch("contact", { hours: v })}
            />
            <Field
              label="Libellé bouton appeler (lien téléphone)"
              value={content.contact.ctaCallLabel}
              onChange={(v) => patch("contact", { ctaCallLabel: v })}
            />
          </Section>

          <Section
            title="SEO global"
            hint="Métadonnées pour l'accueil et la page flotte uniquement"
          >
            <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/40 p-4">
              <Subhead>Accueil</Subhead>
              <Field
                label="Title"
                value={content.seo.homeTitle}
                onChange={(v) => patch("seo", { homeTitle: v })}
              />
              <Field
                label="Meta description"
                value={content.seo.homeDescription}
                onChange={(v) => patch("seo", { homeDescription: v })}
                textarea
              />
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4">
              <Subhead>Flotte /bateaux</Subhead>
              <Field
                label="Title"
                value={content.seo.boatsTitle}
                onChange={(v) => patch("seo", { boatsTitle: v })}
              />
              <Field
                label="Meta description"
                value={content.seo.boatsDescription}
                onChange={(v) => patch("seo", { boatsDescription: v })}
                textarea
              />
            </div>
          </Section>
        </div>
      )}

      {message && <Banner type={message.type}>{message.text}</Banner>}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={exportJson}
            className="text-xs text-slate-400 hover:text-sky-700"
          >
            Exporter JSON
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DestinationPageEditor({
  title,
  hint,
  page,
  onChange,
  boatIdHint,
}: {
  title: string;
  hint?: string;
  page: DestinationPageContent;
  onChange: (next: Partial<DestinationPageContent>) => void;
  boatIdHint: string;
}) {
  return (
    <Section title={title} hint={hint}>
      <CheckboxField
        label="Page publiée"
        checked={page.published}
        onChange={(published) => onChange({ published })}
      />
      <Field
        label="Sur-titre"
        value={page.eyebrow}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <Field
        label="Titre"
        value={page.title}
        onChange={(v) => onChange({ title: v })}
      />
      <Field
        label="Sous-titre"
        value={page.subtitle}
        onChange={(v) => onChange({ subtitle: v })}
        textarea
      />
      <Field
        label="Introduction"
        value={page.intro}
        onChange={(v) => onChange({ intro: v })}
        textarea
      />
      <Field
        label="Raisons de venir (une par ligne)"
        value={page.reasons.join("\n")}
        onChange={(v) =>
          onChange({
            reasons: v
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        textarea
      />
      <Field
        label="Infos pratiques"
        value={page.practicalInfo}
        onChange={(v) => onChange({ practicalInfo: v })}
        textarea
      />
      <Field
        label="Consignes sécurité"
        value={page.safetyInfo}
        onChange={(v) => onChange({ safetyInfo: v })}
        textarea
      />
      <Field
        label="Libellé CTA"
        value={page.ctaLabel}
        onChange={(v) => onChange({ ctaLabel: v })}
      />
      <ImageField
        label="Image principale"
        value={page.image}
        onChange={(url) => onChange({ image: url })}
      />
      <div>
        <Field
          label="Bateaux mis en avant (IDs séparés par des virgules)"
          value={page.featuredBoatIds.join(", ")}
          onChange={(v) =>
            onChange({
              featuredBoatIds: v
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
        />
        {boatIdHint && (
          <p className="mt-1 text-[11px] text-slate-400">
            IDs disponibles : {boatIdHint}
          </p>
        )}
      </div>
      <TwoCol>
        <Field
          label="SEO Title"
          value={page.seoTitle}
          onChange={(v) => onChange({ seoTitle: v })}
        />
        <Field
          label="SEO Description"
          value={page.seoDescription}
          onChange={(v) => onChange({ seoDescription: v })}
          textarea
        />
      </TwoCol>
    </Section>
  );
}

function BoatEditor({
  boat,
  onChange,
  onDelete,
}: {
  boat: CmsBoat;
  onChange: (b: CmsBoat) => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{boat.name}</h2>
          <p className="text-xs text-slate-400">/bateaux/{boat.slug}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-rose-600 hover:text-rose-700"
        >
          Supprimer
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <CheckboxField
          label="Publié"
          checked={boat.published}
          onChange={(published) => onChange({ ...boat, published })}
        />
        <CheckboxField
          label="Mis en avant (accueil)"
          checked={boat.featured}
          onChange={(featured) => onChange({ ...boat, featured })}
        />
        <CheckboxField
          label="Disponible à la location"
          checked={boat.available}
          onChange={(available) => onChange({ ...boat, available })}
        />
      </div>

      <Field
        label="Ordre d'affichage"
        value={String(boat.displayOrder)}
        onChange={(v) =>
          onChange({ ...boat, displayOrder: Number(v) || boat.displayOrder })
        }
      />

      <ImageField
        label="Photo principale"
        value={boat.image}
        onChange={(url) => onChange({ ...boat, image: url })}
      />

      <GalleryField
        label="Galerie (photos supplémentaires)"
        images={boat.gallery}
        onChange={(gallery) => onChange({ ...boat, gallery })}
      />

      <TwoCol>
        <Field
          label="Nom"
          value={boat.name}
          onChange={(v) => onChange({ ...boat, name: v })}
        />
        <div>
          <Field
            label="Slug URL"
            value={boat.slug}
            onChange={(v) => onChange({ ...boat, slug: slugify(v) })}
          />
          <button
            type="button"
            className="mt-1.5 text-[11px] text-sky-600 hover:text-sky-800"
            onClick={() =>
              onChange({ ...boat, slug: slugify(boat.name) || boat.slug })
            }
          >
            Régénérer
          </button>
        </div>
      </TwoCol>

      <Field
        label="Description courte"
        value={boat.shortDescription}
        onChange={(v) => onChange({ ...boat, shortDescription: v })}
        textarea
      />

      <Field
        label="Description"
        value={boat.description}
        onChange={(v) => onChange({ ...boat, description: v })}
        textarea
      />

      <TwoCol>
        <Field
          label="SEO Title"
          value={boat.seoTitle}
          onChange={(v) => onChange({ ...boat, seoTitle: v })}
        />
        <Field
          label="SEO Description"
          value={boat.seoDescription}
          onChange={(v) => onChange({ ...boat, seoDescription: v })}
          textarea
        />
      </TwoCol>

      <TwoCol>
        <Field
          label="Année"
          value={String(boat.year)}
          onChange={(v) => onChange({ ...boat, year: Number(v) || boat.year })}
        />
        <Field
          label="Type"
          value={boat.type}
          onChange={(v) => onChange({ ...boat, type: v })}
        />
      </TwoCol>

      <label className={labelCls}>
        Catégorie
        <select
          value={boat.category}
          onChange={(e) =>
            onChange({
              ...boat,
              category: e.target.value as CmsBoat["category"],
            })
          }
          className={selectCls}
        >
          {BOAT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="Capacité (personnes)"
        value={String(boat.capacity)}
        onChange={(v) =>
          onChange({ ...boat, capacity: Number(v) || boat.capacity })
        }
      />

      <PricingRowsEditor boat={boat} onChange={onChange} />

      <TwoCol>
        <Field
          label="Prix indicatif carte / jour (€)"
          value={String(boat.pricePerDay)}
          onChange={(v) =>
            onChange({ ...boat, pricePerDay: Number(v) || 0 })
          }
        />
        <Field
          label="Prix indicatif demi-journée (€)"
          value={String(boat.priceHalfDay)}
          onChange={(v) =>
            onChange({ ...boat, priceHalfDay: Number(v) || 0 })
          }
        />
      </TwoCol>

      <TwoCol>
        <Field
          label="Lieu"
          value={boat.location}
          onChange={(v) => onChange({ ...boat, location: v })}
        />
        <Field
          label="Note"
          value={String(boat.rating)}
          onChange={(v) => onChange({ ...boat, rating: Number(v) || 0 })}
        />
      </TwoCol>

      <TwoCol>
        <Field
          label="Longueur"
          value={boat.length}
          onChange={(v) => onChange({ ...boat, length: v })}
        />
        <Field
          label="Moteur"
          value={boat.motor}
          onChange={(v) => onChange({ ...boat, motor: v })}
        />
      </TwoCol>

      <Field
        label="Permis"
        value={boat.license}
        onChange={(v) => onChange({ ...boat, license: v })}
      />

      <Field
        label="Tags (séparés par des virgules)"
        value={boat.tags.join(", ")}
        onChange={(v) =>
          onChange({
            ...boat,
            tags: v
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
      />

      <Field
        label="Équipements (un par ligne)"
        value={boat.features.join("\n")}
        onChange={(v) =>
          onChange({
            ...boat,
            features: v
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        textarea
      />

      <Field
        label="Services inclus (un par ligne)"
        value={boat.includedServices.join("\n")}
        onChange={(v) =>
          onChange({
            ...boat,
            includedServices: v
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        textarea
      />

      <Field
        label="Services optionnels (un par ligne)"
        value={boat.optionalServices.join("\n")}
        onChange={(v) =>
          onChange({
            ...boat,
            optionalServices: v
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        textarea
      />
    </div>
  );
}

function parsePriceInput(v: string): number | null {
  const t = v.trim();
  if (!t || /^n\/?d$/i.test(t) || t === "-") return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function PricingRowsEditor({
  boat,
  onChange,
}: {
  boat: CmsBoat;
  onChange: (b: CmsBoat) => void;
}) {
  function updateRow(index: number, patch: Partial<CmsPriceRow>) {
    const pricingRows = boat.pricingRows.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange({ ...boat, pricingRows });
  }

  function addRow() {
    onChange({
      ...boat,
      pricingRows: [
        ...boat.pricingRows,
        {
          id: `r${Date.now()}`,
          label: "Nouveau créneau",
          lowSeason: null,
          highSeason: null,
        },
      ],
    });
  }

  function removeRow(index: number) {
    onChange({
      ...boat,
      pricingRows: boat.pricingRows.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/40 p-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
          Grille tarifaire
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Laissez vide ou « N/D » pour un créneau non disponible. Les prix s’affichent
          sur la fiche bateau.
        </p>
      </div>

      <Field
        label="Mention sous la grille"
        value={boat.pricingNote}
        onChange={(v) => onChange({ ...boat, pricingNote: v })}
      />

      <TwoCol>
        <Field
          label="Libellé basse saison"
          value={boat.lowSeasonLabel}
          onChange={(v) => onChange({ ...boat, lowSeasonLabel: v })}
        />
        <Field
          label="Libellé haute saison"
          value={boat.highSeasonLabel}
          onChange={(v) => onChange({ ...boat, highSeasonLabel: v })}
        />
      </TwoCol>

      <div className="overflow-x-auto rounded-lg border border-sky-200 bg-white">
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Créneau</th>
              <th className="px-3 py-2 font-medium">Basse saison (€)</th>
              <th className="px-3 py-2 font-medium">Haute saison (€)</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {boat.pricingRows.map((row, index) => (
              <tr key={row.id} className="border-t border-sky-100">
                <td className="px-2 py-1.5">
                  <input
                    value={row.label}
                    onChange={(e) => updateRow(index, { label: e.target.value })}
                    className="h-9 w-full rounded-md border border-sky-200 px-2 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    value={row.lowSeason == null ? "" : String(row.lowSeason)}
                    onChange={(e) =>
                      updateRow(index, { lowSeason: parsePriceInput(e.target.value) })
                    }
                    placeholder="N/D"
                    className="h-9 w-full rounded-md border border-sky-200 px-2 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    value={row.highSeason == null ? "" : String(row.highSeason)}
                    onChange={(e) =>
                      updateRow(index, {
                        highSeason: parsePriceInput(e.target.value),
                      })
                    }
                    placeholder="N/D"
                    className="h-9 w-full rounded-md border border-sky-200 px-2 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-[11px] text-rose-600 hover:text-rose-700"
                  >
                    Suppr.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addRow} className={dashedBtnCls}>
        + Ajouter un créneau
      </button>
    </div>
  );
}

function CalanqueEditor({
  item,
  onChange,
}: {
  item: CmsCalanque;
  onChange: (c: CmsCalanque) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        <CheckboxField
          label="Publiée"
          checked={item.published}
          onChange={(published) => onChange({ ...item, published })}
        />
        <Field
          label="Ordre d'affichage"
          value={String(item.displayOrder)}
          onChange={(v) =>
            onChange({ ...item, displayOrder: Number(v) || item.displayOrder })
          }
        />
      </div>

      <TwoCol>
        <Field
          label="Nom"
          value={item.name}
          onChange={(v) => onChange({ ...item, name: v })}
        />
        <Field
          label="Sous-titre"
          value={item.subtitle}
          onChange={(v) => onChange({ ...item, subtitle: v })}
        />
      </TwoCol>
      <div>
        <Field
          label="Slug / id (ancre & carte)"
          value={item.slug}
          onChange={(v) => {
            const s = slugify(v);
            onChange({ ...item, slug: s, id: s || item.id });
          }}
        />
        <button
          type="button"
          className="mt-1.5 text-[11px] text-sky-600 hover:text-sky-800"
          onClick={() => {
            const s = slugify(item.name);
            onChange({ ...item, slug: s, id: s || item.id });
          }}
        >
          Régénérer depuis le nom
        </button>
      </div>
      <Field
        label="Description"
        value={item.description}
        onChange={(v) => onChange({ ...item, description: v })}
        textarea
      />
      <Field
        label="Point fort (pastille)"
        value={item.highlight}
        onChange={(v) => onChange({ ...item, highlight: v })}
      />
      <GalleryField
        label="Photos (au moins une requise)"
        images={item.images}
        onChange={(images) => onChange({ ...item, images })}
      />
      <ThreeCol>
        <Field
          label="Latitude"
          value={String(item.lat)}
          onChange={(v) => onChange({ ...item, lat: Number(v) || item.lat })}
        />
        <Field
          label="Longitude"
          value={String(item.lng)}
          onChange={(v) => onChange({ ...item, lng: Number(v) || item.lng })}
        />
        <Field
          label="Lien Google Maps"
          value={item.mapsUrl}
          onChange={(v) => onChange({ ...item, mapsUrl: v })}
        />
      </ThreeCol>
    </div>
  );
}

function TeamMemberEditor({
  item,
  onChange,
}: {
  item: CmsTeamMember;
  onChange: (m: CmsTeamMember) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        <CheckboxField
          label="Publié"
          checked={item.published}
          onChange={(published) => onChange({ ...item, published })}
        />
        <Field
          label="Ordre d'affichage"
          value={String(item.displayOrder)}
          onChange={(v) =>
            onChange({ ...item, displayOrder: Number(v) || item.displayOrder })
          }
        />
      </div>
      <TwoCol>
        <Field
          label="Nom"
          value={item.name}
          onChange={(v) => onChange({ ...item, name: v })}
        />
        <Field
          label="Rôle"
          value={item.role}
          onChange={(v) => onChange({ ...item, role: v })}
        />
      </TwoCol>
      <Field
        label="Bio"
        value={item.bio}
        onChange={(v) => onChange({ ...item, bio: v })}
        textarea
      />
      <ImageField
        label="Photo"
        value={item.image}
        onChange={(url) => onChange({ ...item, image: url })}
      />
    </div>
  );
}

function ReviewEditor({
  item,
  onChange,
}: {
  item: CmsReview;
  onChange: (r: CmsReview) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        <CheckboxField
          label="Publié"
          checked={item.published}
          onChange={(published) => onChange({ ...item, published })}
        />
        <Field
          label="Ordre d'affichage"
          value={String(item.displayOrder)}
          onChange={(v) =>
            onChange({ ...item, displayOrder: Number(v) || item.displayOrder })
          }
        />
      </div>
      <TwoCol>
        <Field
          label="Nom"
          value={item.name}
          onChange={(v) => onChange({ ...item, name: v })}
        />
        <Field
          label="Ville / origine"
          value={item.location}
          onChange={(v) => onChange({ ...item, location: v })}
        />
      </TwoCol>
      <TwoCol>
        <Field
          label="Date (affichée)"
          value={item.date}
          onChange={(v) => onChange({ ...item, date: v })}
        />
        <Field
          label="Source"
          value={item.source}
          onChange={(v) => onChange({ ...item, source: v })}
        />
      </TwoCol>
      <TwoCol>
        <label className={labelCls}>
          Note
          <select
            value={item.rating}
            onChange={(e) =>
              onChange({ ...item, rating: Number(e.target.value) })
            }
            className={selectCls}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Catégorie
          <select
            value={item.category}
            onChange={(e) =>
              onChange({
                ...item,
                category: e.target.value as CmsReview["category"],
              })
            }
            className={selectCls}
          >
            {BOAT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </TwoCol>
      <Field
        label="Texte de l'avis"
        value={item.text}
        onChange={(v) => onChange({ ...item, text: v })}
        textarea
      />
    </div>
  );
}

/* ——— UI primitives ——— */

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {hint && <p className="mt-1 mb-4 text-xs text-slate-400">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-medium text-sky-700">{children}</h3>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function ThreeCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>;
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-200"
      />
      {label}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className={labelCls}>
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${inputCls} py-2`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} h-10`}
        />
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) {
        setError(j.error || "Upload échoué");
        return;
      }
      onChange(j.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-28 w-40 rounded-lg object-cover ring-1 ring-sky-200"
          />
        ) : (
          <div className="flex h-28 w-40 items-center justify-center rounded-lg border border-dashed border-sky-300 text-xs text-slate-400">
            Aucune image
          </div>
        )}
        <div className="min-w-[200px] flex-1 space-y-2">
          <Field label="URL / chemin" value={value} onChange={onChange} />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={dashedBtnCls}
          >
            {uploading ? "Upload…" : "Uploader une photo"}
          </button>
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function GalleryField({
  label,
  images,
  onChange,
}: {
  label: string;
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const j = (await res.json()) as { url?: string };
        if (res.ok && j.url) next.push(j.url);
      }
      onChange(next);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-20 w-28 rounded-lg object-cover ring-1 ring-sky-200"
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white"
              aria-label="Retirer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={dashedBtnCls}
      >
        {uploading ? "Upload…" : "+ Ajouter des photos"}
      </button>
    </div>
  );
}

function ArrayEditor<T extends { id?: string }>({
  items,
  onChange,
  renderItem,
  addLabel,
  emptyValue,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, onChange: (item: T) => void, index: number) => React.ReactNode;
  addLabel: string;
  emptyValue: T;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={item.id ?? `item-${i}`}
          className="rounded-xl border border-sky-200 bg-sky-50/30 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-xs text-rose-600 hover:text-rose-700"
            >
              Supprimer
            </button>
          </div>
          {renderItem(
            item,
            (next) => onChange(items.map((it, j) => (j === i ? next : it))),
            i,
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...items,
            typeof emptyValue === "object" && emptyValue !== null
              ? { ...emptyValue, id: `${Date.now()}` }
              : emptyValue,
          ])
        }
        className={`w-full py-3 text-sm ${dashedBtnCls}`}
      >
        {addLabel}
      </button>
    </div>
  );
}

function Banner({
  type,
  children,
}: {
  type: "ok" | "err" | "warn";
  children: React.ReactNode;
}) {
  const styles = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-900",
    err: "border-rose-200 bg-rose-50 text-rose-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
  }[type];
  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}
