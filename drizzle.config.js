/** @type { import("drizzle-kit").Config } */
export default {
  out: "./.drizzle",
  driver: "libsql",
  schema: "./src/lib/database/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
