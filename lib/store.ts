import { City, Spot } from "@/types";
import { create } from "zustand";


type CityStore = {
  cities: City[];
  currentCity?: City & { spots?: Spot[] };
  setCurrentCity: (city: City & { spots?: Spot[] }) => void;
  // ...other city store methods
};

export const useCityStore = create<CityStore>((set) => ({
  cities: [],
  currentCity: undefined,
  setCurrentCity: (city) => set({ currentCity: city }),
  // ...other city store methods
}));