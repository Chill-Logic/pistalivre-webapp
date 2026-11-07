import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000/api"),
});

/** Validated build-time env. Fails loudly at boot instead of at first request. */
export const env = envSchema.parse(import.meta.env);

/** Backend origin, for URLs the API returns relative to its root (files). */
export const apiOrigin = new URL(env.VITE_API_URL).origin;
