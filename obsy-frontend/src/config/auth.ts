import type { AuthChangeEvent, Provider, Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

export type { User } from "@supabase/supabase-js";

import env from "@/config/env";

// create a single supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

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

/**
 * Get the access token from the current session.
 * Throws an error if there is no session.
 *
 * @returns
 */
export const getAccessToken = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error("no session found");
  }

  return session.access_token;
};

export default supabase;
