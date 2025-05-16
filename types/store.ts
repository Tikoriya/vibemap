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
