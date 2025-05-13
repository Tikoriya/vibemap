import { Spot } from "@/types";
import { create } from "zustand";

type Store = {
  spots: Spot[];
  addSpot: (spot: Spot) => void;
  setSpots: (spots: Spot[]) => void;
};

export const dummySpots: Spot[] = [
  {
    id: "1",
    name: "Miradouro de Santa Catarina",
    type: "Viewpoint",
    tags: ["scenic", "outdoor", "sunset"],
    notes: "Great place to watch the sunset over Lisbon.",
    city: "Lisbon",
  },
  {
    id: "2",
    name: "LX Factory",
    type: "Cultural Center",
    tags: ["art", "food", "shopping"],
    notes: "Trendy spot with restaurants, shops, and street art.",
    city: "Lisbon",
  },
  {
    id: "3",
    name: "Praça do Comércio",
    type: "Square",
    tags: ["historic", "landmark", "riverfront"],
    notes: "Iconic square by the river, popular with tourists.",
    city: "Lisbon",
  },
];

export const useSpotStore = create<Store>((set) => ({
  spots: dummySpots,
  addSpot: (spot) =>
    set((state) => ({ spots: [...state.spots, spot] })),
  setSpots: (spots) => set({ spots }),
}));