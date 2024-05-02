import { toast } from "svelte-sonner";
import { MutationCache } from "@tanstack/svelte-query";
import { createTRPCSvelte, httpBatchLink } from "trpc-svelte-query";

import type { AppRouter } from "$lib/routers";
import { createTRPCProxyClient } from "@trpc/client";

export const trpc = createTRPCSvelte<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
  queryClientConfig: {
    defaultOptions: {
      queries: { refetchOnWindowFocus: false }
    }
  }
});

export const trpcHttp = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })]
});
