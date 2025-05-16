import { AuthState, CityStore } from "@/types/store";
import { create } from "zustand";

export const useCityStore = create<CityStore>((set) => ({
  cities: [],
  currentCity: undefined,
  setCurrentCity: (city) => set({ currentCity: city }),
  // ...other city store methods
}));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));