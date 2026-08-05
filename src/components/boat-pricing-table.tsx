import type { CmsBoat } from "@/lib/site-content";
import { formatPriceCell } from "@/lib/boats";

type BoatPricingTableProps = {
  boat: CmsBoat;
};

export function BoatPricingTable({ boat }: BoatPricingTableProps) {
  if (!boat.pricingRows.length) return null;

  return (
    <section className="rounded-2xl border border-white/15 bg-black/30 p-5 md:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-white/80 uppercase md:text-sm">
            Tarifs
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
            Grille tarifaire
          </h2>
        </div>
        {boat.pricingNote ? (
          <p className="text-sm text-white/85 md:text-base">{boat.pricingNote}</p>
        ) : null}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[300px] border-collapse text-left text-base md:text-lg">
          <thead>
            <tr className="border-b border-white/15">
              <th className="pb-4 pr-3 text-sm font-semibold text-white md:text-base">
                Créneau
              </th>
              <th className="px-2 pb-4 text-right">
                <span className="block text-sm font-semibold tracking-wide text-white uppercase md:text-base">
                  Basse saison
                </span>
                <span className="mt-1 block text-sm font-medium leading-snug text-white normal-case tracking-normal md:text-base">
                  {boat.lowSeasonLabel.replace(/^Basse saison\s*·\s*/i, "")}
                </span>
              </th>
              <th className="pb-4 pl-2 text-right">
                <span className="block text-sm font-semibold tracking-wide text-white uppercase md:text-base">
                  Haute saison
                </span>
                <span className="mt-1 block text-sm font-medium leading-snug text-white normal-case tracking-normal md:text-base">
                  {boat.highSeasonLabel.replace(/^Haute saison\s*·\s*/i, "")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {boat.pricingRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/10 last:border-0"
              >
                <td className="py-4 pr-3 font-medium text-white">{row.label}</td>
                <td className="px-2 py-4 text-right tabular-nums text-white">
                  {row.lowSeason == null ? (
                    <span className="text-white/55">N/D</span>
                  ) : (
                    formatPriceCell(row.lowSeason)
                  )}
                </td>
                <td className="py-4 pl-2 text-right tabular-nums font-semibold text-white">
                  {row.highSeason == null ? (
                    <span className="font-medium text-white/55">N/D</span>
                  ) : (
                    formatPriceCell(row.highSeason)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
