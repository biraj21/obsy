import mongoose from "mongoose";

import env from "#src/config/env.js";

const connect = async () => {
  await mongoose.connect(env.MONGO_URL, {
    serverSelectionTimeoutMS: 10_000,
  });
};

export const disconnect = async () => {
  await mongoose.disconnect();
};

/**
 * Connect to MongoDB with retries
 * @param retries - number of retries (default: 3)
 * @returns void
 */
export const connectWithRetries = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log("💿 connecting to MongoDB...");
      await connect();
      console.log("💿✅ connected to MongoDB");
      return;
    } catch (error) {
      console.error(`💿❌ failed to connect to MongoDB: ${error}`);
      if (i === retries - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }
};
