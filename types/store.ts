import { Session, User } from "@supabase/supabase-js";
import { City, Spot } from ".";

export type CityStore = {
  cities: City[];
  currentCity?: City & { spots?: Spot[] };
  setCurrentCity: (city: City & { spots?: Spot[] }) => void;
  // ...other city store methods
};

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

// Bridges the freshly created label from the "New Label" modal back to the tag
// picker underneath it, so it can be auto-selected once the modal dismisses.
export type LabelDraftStore = {
  pendingLabel: string | null;
  setPendingLabel: (label: string) => void;
  clearPendingLabel: () => void;
};
