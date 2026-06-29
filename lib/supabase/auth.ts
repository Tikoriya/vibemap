import { supabase } from "@/utils/supabase";

export const authApi = {
  signInWithMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "tukka://auth/callback",
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
  },

  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUpWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Apple/Google sign-in removed for now — both require a paid Apple Developer
  // account (Sign In with Apple entitlement) / native config. Re-add when enabling them.

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};
