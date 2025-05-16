import { useAuthStore } from '@/lib/store';
import { supabase } from './supabase';

export const initAuth = async () => {
  const { setUser, setSession, setLoading } = useAuthStore.getState();

  const { data } = await supabase.auth.getSession();
  setSession(data.session);
  setUser(data.session?.user ?? null);
  setLoading(false);

  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
    });
  });
};