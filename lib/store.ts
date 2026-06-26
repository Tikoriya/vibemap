import { AuthState, CityStore, LabelDraftStore, UiPrefsStore } from "@/types/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

export const useUiPrefsStore = create<UiPrefsStore>()(
  persist(
    (set) => ({
      filtersOpen: false,
      setFiltersOpen: (open) => set({ filtersOpen: open }),
      cityLastOpened: {},
      markCityOpened: (cityId) =>
        set((state) => ({
          cityLastOpened: { ...state.cityLastOpened, [cityId]: Date.now() },
        })),
    }),
    {
      name: "vibemap-ui-prefs",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useLabelDraftStore = create<LabelDraftStore>((set) => ({
  pendingLabel: null,
  setPendingLabel: (label) => set({ pendingLabel: label }),
  clearPendingLabel: () => set({ pendingLabel: null }),
  renamedLabel: null,
  setRenamedLabel: (payload) => set({ renamedLabel: payload }),
  clearRenamedLabel: () => set({ renamedLabel: null }),
}));