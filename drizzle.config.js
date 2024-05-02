/** @type { import("drizzle-kit").Config } */
export default {
  out: "./.drizzle",
  driver: "turso",
  schema: "./src/lib/database/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  },
};
