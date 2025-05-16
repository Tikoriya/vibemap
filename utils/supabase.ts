
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://kimduvmcpqzzmrhjoojx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpbWR1dm1jcHF6em1yaGpvb2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTc4OTgsImV4cCI6MjA2Mjg5Mzg5OH0.HIcHno1VUIUewPpXWiB4V2pb7HrIF4oyw0k7meoPrkc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    // autoRefreshToken: true,
    // persistSession: true,
    // detectSessionInUrl: false,
  },
});