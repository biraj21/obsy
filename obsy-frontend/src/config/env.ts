import { z } from "zod";

const envSchema = z.object({
  BACKEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
});

const env = envSchema.parse({
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export default env;
