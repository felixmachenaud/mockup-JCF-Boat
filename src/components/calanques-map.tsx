"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { calanques, calanquesMapCenter } from "@/lib/calanques";

const RED_MARKER = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  mapTypeId: "roadmap",
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: "cooperative",
};

function InteractiveMap() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [gestureHandling, setGestureHandling] = useState<"cooperative" | "greedy">("cooperative");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setGestureHandling(mq.matches ? "greedy" : "cooperative");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    calanques.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
    map.fitBounds(bounds, { top: 64, right: 64, bottom: 64, left: 64 });
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={calanquesMapCenter}
      zoom={11}
      options={{ ...mapOptions, gestureHandling }}
      onLoad={onLoad}
    >
      {calanques.map((calanque) => (
        <Marker
          key={calanque.id}
          position={{ lat: calanque.lat, lng: calanque.lng }}
          title={calanque.name}
          icon={RED_MARKER}
          onClick={() => setActiveId(calanque.id)}
        />
      ))}

      {activeId && (() => {
        const calanque = calanques.find((c) => c.id === activeId);
        if (!calanque) return null;
        return (
          <InfoWindow
            position={{ lat: calanque.lat, lng: calanque.lng }}
            onCloseClick={() => setActiveId(null)}
          >
            <div className="min-w-[160px] p-1">
              <p className="text-sm font-semibold text-slate-900">{calanque.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{calanque.subtitle}</p>
              <a
                href={calanque.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-red-600 hover:underline"
              >
                Itinéraire →
              </a>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}

function MapWithApiKey({ apiKey }: { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "jcf-google-maps",
  });

  if (loadError) return <EmbedFallbackMap />;
  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
        Chargement de Google Maps…
      </div>
    );
  }

  return <InteractiveMap />;
}

/** Carte embed Google — visible sans clé API */
function EmbedFallbackMap() {
  const fallbackSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d92756.3!2d5.478!3d43.209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c986b71edc8c79%3A0x964875473ab727d4!2sParc%20national%20des%20Calanques!5e0!3m2!1sfr!2sfr!4v1710000000000!5m2!1sfr!2sfr";

  return (
    <iframe
      title="Carte des calanques — Port Miou, Port Pin, En Vau, Sormiou"
      src={fallbackSrc}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

export function CalanquesMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <section id="carte-calanques" className="scroll-mt-28 px-4 pb-8 md:px-8 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.25em] text-white/70 uppercase">
            Carte
          </p>
          <h2 className="text-2xl font-semibold text-white md:text-4xl">
            Localisez les 4 calanques
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Port Miou · Port Pin · En Vau · Sormiou
          </p>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl sm:h-[480px] md:h-[640px] lg:h-[720px]">
          {apiKey ? <MapWithApiKey apiKey={apiKey} /> : <EmbedFallbackMap />}
        </div>

        {!apiKey && (
          <p className="mt-3 text-center text-xs text-white/50">
            Carte Google affichée. Ajoutez{" "}
            <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
            pour activer les marqueurs rouges interactifs.
          </p>
        )}

        <ul className="mt-6 flex flex-wrap justify-center gap-3">
          {calanques.map((c) => (
            <li key={c.id}>
              <a
                href={c.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2.5 text-sm text-white/85 transition-colors active:scale-[0.98] hover:border-white/35 hover:text-white"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
