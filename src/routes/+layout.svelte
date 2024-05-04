<script lang="ts">
  import "../app.pcss";
  import { Toaster, toast } from "svelte-sonner";
  import { ModeWatcher, mode } from "mode-watcher";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";

  import { trpc } from "$lib/utilities/trpc-client";
  import ServiceWorker from "$lib/components/ServiceWorker.svelte";
  import { setupOfflineMutations } from "$lib/utilities/offlineMutations";

  export let data;
  $: queryClient = trpc.hydrateFromServer(data.trpc);
  $: if (queryClient) setupOfflineMutations(queryClient);
</script>

<ModeWatcher />

<Toaster
  theme={$mode}
  class="toaster group"
  toastOptions={{
    classes: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
    }
  }} />

<ServiceWorker />

<QueryClientProvider client={queryClient}>
  <slot />
  <SvelteQueryDevtools buttonPosition="bottom-right" />
</QueryClientProvider>
