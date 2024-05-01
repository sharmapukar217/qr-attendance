import { createTRPCSvelteServer } from "trpc-svelte-query/server";
import { appRouter } from "$lib/routers";

export const trpcServer = createTRPCSvelteServer({
  router: appRouter,
  endpoint: "/api/trpc",
  createContext: () => ({})
});
