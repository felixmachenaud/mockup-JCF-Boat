"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Bookmark, ArrowUpDown } from "lucide-react";
import { mockBoats, boatTypes, type SortOption } from "@/lib/mock-boats";
import { filterBoats, defaultFilters, type FleetFilters } from "@/lib/filter-boats";
import { BoatCard } from "@/components/boat-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/utils";

const sortLabels: Record<SortOption, string> = {
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  capacity: "Capacité",
  rating: "Meilleures notes",
};

export function FleetLibrary() {
  const [filters, setFilters] = useState<FleetFilters>(defaultFilters);

  const filteredBoats = useMemo(() => filterBoats(mockBoats, filters), [filters]);

  const updateFilter = <K extends keyof FleetFilters>(key: K, value: FleetFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section id="fleet" className="bg-white/40 px-4 py-16 backdrop-blur-sm md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-10 text-center md:text-left">
          <p className="mb-2 text-sm font-medium tracking-widest text-sky-500 uppercase">
            Notre flotte
          </p>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Choisissez votre bateau
          </h2>
          <p className="mt-3 text-slate-500">
            Day cruisers et RIBs pour explorer les calanques de Cassis.
          </p>
        </div>

        {/* Search bar */}
        <div className="sticky top-0 z-40 -mx-4 bg-white/70 px-4 py-4 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:px-0 md:py-0">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un bateau..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-11"
            />
          </div>

          {/* Toolbar */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500">
              {filteredBoats.length} bateau{filteredBoats.length > 1 ? "x" : ""} disponible
              {filteredBoats.length > 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex">
                <Bookmark className="h-4 w-4" />
                Sauvegarder
              </Button>

              <Select
                value={filters.sort}
                onValueChange={(v) => updateFilter("sort", v as SortOption)}
              >
                <SelectTrigger className="h-9 w-auto gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {sortLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-8">
                    {/* Type */}
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">Type de bateau</p>
                      <div className="flex flex-wrap gap-2">
                        {boatTypes.map((type) => (
                          <Button
                            key={type}
                            variant={filters.type === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFilter("type", type)}
                          >
                            {type === "All" ? "Tous" : type}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Capacité min. : {filters.minCapacity} pers.
                      </p>
                      <Slider
                        min={0}
                        max={12}
                        step={2}
                        value={[filters.minCapacity]}
                        onValueChange={([v]) => updateFilter("minCapacity", v)}
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Budget max. : {formatPrice(filters.maxPrice)}/jour
                      </p>
                      <Slider
                        min={200}
                        max={1000}
                        step={50}
                        value={[filters.maxPrice]}
                        onValueChange={([v]) => updateFilter("maxPrice", v)}
                      />
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">Disponibles uniquement</p>
                      <Button
                        variant={filters.availableOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter("availableOnly", !filters.availableOnly)}
                      >
                        {filters.availableOnly ? "Oui" : "Non"}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Boat grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBoats.length > 0 ? (
            filteredBoats.map((boat) => <BoatCard key={boat.id} boat={boat} />)
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">
              Aucun bateau ne correspond à vos critères. Essayez d&apos;élargir vos filtres.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
