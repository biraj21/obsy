import type { AuthChangeEvent, Provider, Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

// create a single supabase client
const supabase = createClient(
  "https://yfsdeetwnbbabmiscepp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc2RlZXR3bmJiYWJtaXNjZXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNzYzMzEsImV4cCI6MjA1NTg1MjMzMX0.Gn6ibNt4pyc_venvbgtolup79qCProJ2lf2EDpnilFo"
);

const signIn = async (provider: Provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    throw error;
  }
};

// sign in with GitHub
export async function signInWithGithub() {
  await signIn("github");
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Get the current session from the Supabase client.
 * Throws an error if there is no session.
 *
 * @returns
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
};

export type { User };

export default supabase;
