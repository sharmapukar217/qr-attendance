<script lang="ts">
  import "../app.css";
  import NProgress from "nprogress";
  import { navigating } from "$app/stores";
  import { Toaster } from "svelte-sonner";
  import { ModeWatcher, mode } from "mode-watcher";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
  import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

  import { trpc } from "$lib/utilities/trpc-client";
  import QueryPersist from "$lib/components/QueryPersist.svelte";
  import ServiceWorker from "$lib/components/ServiceWorker.svelte";
  import { setupOfflineMutations } from "$lib/utilities/offlineMutations";

  export let data;
  $: queryClient = trpc.hydrateFromServer(data.trpc);
  $: if (queryClient) setupOfflineMutations(queryClient);

  NProgress.configure({ showSpinner: false });
  $: $navigating ? NProgress.start() : NProgress.done();

  const persister = createSyncStoragePersister({
    storage: typeof window === "undefined" ? undefined : window.localStorage
  });
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

<QueryPersist client={queryClient} persistOptions={{ persister }}>
  <slot />
  <SvelteQueryDevtools buttonPosition="bottom-right" />
</QueryPersist>

