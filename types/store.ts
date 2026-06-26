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
// `renamedLabel` carries an edit (old -> new) so the picker can keep a selected
// tag selected after its label changes.
export type LabelDraftStore = {
  pendingLabel: string | null;
  setPendingLabel: (label: string) => void;
  clearPendingLabel: () => void;
  renamedLabel: { from: string; to: string } | null;
  setRenamedLabel: (payload: { from: string; to: string }) => void;
  clearRenamedLabel: () => void;
};
