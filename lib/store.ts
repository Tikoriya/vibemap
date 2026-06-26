import { AuthState, CityStore, LabelDraftStore } from "@/types/store";
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

export const useLabelDraftStore = create<LabelDraftStore>((set) => ({
  pendingLabel: null,
  setPendingLabel: (label) => set({ pendingLabel: label }),
  clearPendingLabel: () => set({ pendingLabel: null }),
  renamedLabel: null,
  setRenamedLabel: (payload) => set({ renamedLabel: payload }),
  clearRenamedLabel: () => set({ renamedLabel: null }),
}));