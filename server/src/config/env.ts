import dotenv from "dotenv";
import { z } from "zod";

// we don't want to put parsed env vars in process.env
const processEnv = {};
dotenv.config({ processEnv });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)),

  MONGO_URL: z.string().url(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),

  SDK_JWT_SECRET: z.string(),
});

const parseEnvVars = () => {
  const result = envSchema.safeParse(processEnv);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
};

const env = parseEnvVars();

export default env;
