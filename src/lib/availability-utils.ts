import type { Boat, BoatCategoryFilter } from "./mock-boats";

export type TimeSlotFilter = "any" | "morning" | "afternoon";

export type AvailabilitySearch = {
  people: number;
  date: string;
  slot: TimeSlotFilter;
  category: BoatCategoryFilter;
};

export const defaultAvailabilitySearch: AvailabilitySearch = {
  people: 2,
  date: "",
  slot: "any",
  category: "all",
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isHalfDayUnavailable(
  boatId: string,
  date: Date,
  slot: "morning" | "afternoon"
) {
  const hash =
    (boatId.charCodeAt(0) + date.getMonth() * 31 + date.getDate() * 7 + (slot === "afternoon" ? 3 : 0)) %
    5;
  return hash === 0;
}

export function getEndOfWeek(date: Date) {
  const end = startOfDay(date);
  const daysUntilSunday = (7 - end.getDay()) % 7;
  end.setDate(end.getDate() + daysUntilSunday);
  return end;
}

export function getHalfDaysAvailableUntilWeekEnd(
  boatId: string,
  boatAvailable: boolean,
  fromDate = new Date()
) {
  if (!boatAvailable) return 0;

  let count = 0;
  const cursor = startOfDay(fromDate);
  const end = getEndOfWeek(fromDate);

  while (cursor <= end) {
    for (const slot of ["morning", "afternoon"] as const) {
      if (!isHalfDayUnavailable(boatId, cursor, slot)) {
        count += 1;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function filterBoatsByAvailability(boats: Boat[], search: AvailabilitySearch) {
  return boats.filter((boat) => {
    if (!boat.available) return false;
    if (boat.capacity < search.people) return false;
    if (search.category !== "all" && boat.category !== search.category) return false;

    if (search.date) {
      const date = new Date(`${search.date}T12:00:00`);
      if (search.slot === "any") {
        const hasMorning = !isHalfDayUnavailable(boat.id, date, "morning");
        const hasAfternoon = !isHalfDayUnavailable(boat.id, date, "afternoon");
        if (!hasMorning && !hasAfternoon) return false;
      } else if (isHalfDayUnavailable(boat.id, date, search.slot)) {
        return false;
      }
    }

    return true;
  });
}

export function getBoatNatureLabel(boat: Boat) {
  if (boat.category === "sans-permis") return "Sans permis";
  if (boat.category === "electrique") return "Électrique";
  return boat.type;
}

export function todayInputValue() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}
