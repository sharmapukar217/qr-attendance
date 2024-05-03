import { createTRPCSvelte, httpBatchLink } from "trpc-svelte-query";

import type { AppRouter } from "$lib/routers";
import { createTRPCProxyClient } from "@trpc/client";

export const trpc = createTRPCSvelte<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
  queryClientConfig: {
    defaultOptions: {
      queries: { refetchOnWindowFocus: false },
      mutations: { networkMode: "offlineFirst" }
    }
  }
});

export const trpcHttp = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })]
});
