import { assertSupabase } from "../lib/supabase";

export const authService = {
  async signIn({ email, password }) {
    const supabase = assertSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signOut() {
    const supabase = assertSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },
};
