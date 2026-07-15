import type { Boat, SortOption } from "./mock-boats";

export type FleetFilters = {
  search: string;
  type: string;
  minCapacity: number;
  maxPrice: number;
  availableOnly: boolean;
  sort: SortOption;
};

export const defaultFilters: FleetFilters = {
  search: "",
  type: "All",
  minCapacity: 0,
  maxPrice: 1000,
  availableOnly: false,
  sort: "price-asc",
};

export function filterBoats(boats: Boat[], filters: FleetFilters): Boat[] {
  let result = boats.filter((boat) => {
    const matchesSearch =
      filters.search === "" ||
      boat.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      boat.type.toLowerCase().includes(filters.search.toLowerCase()) ||
      boat.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesType = filters.type === "All" || boat.type === filters.type;
    const matchesCapacity = boat.capacity >= filters.minCapacity;
    const matchesPrice = boat.pricePerDay <= filters.maxPrice;
    const matchesAvailability = !filters.availableOnly || boat.available;

    return matchesSearch && matchesType && matchesCapacity && matchesPrice && matchesAvailability;
  });

  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
      break;
    case "capacity":
      result = [...result].sort((a, b) => b.capacity - a.capacity);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
  }

  return result;
}
