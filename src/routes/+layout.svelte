<script lang="ts">
  import "../app.pcss";
  import { Toaster, toast } from "svelte-sonner";
  import { ModeWatcher, mode } from "mode-watcher";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";

  import { trpc, trpcHttp } from "$lib/utilities/trpc-client";

  export let data;
  $: queryClient = trpc.hydrateFromServer(data.trpc);

  $: if (queryClient) {
    queryClient.setMutationDefaults(["deleteEvent"], {
      async mutationFn({ eventId }: { eventId: number }) {
        await trpc.getEvents.utils.cancel();
        const previousEvents = trpc.getEvents.utils.getData();

        try {
          trpc.getEvents.utils.cancel();
          await trpcHttp.deleteEvent.mutate({ eventId });

          trpc.getEvents.utils.setData({ date: undefined }, (old) => {
            if (!old) return [];
            return old.filter((o) => o.id !== eventId);
          });

          return { previousEvents, message: "Event deleted successfully!" };
        } catch (err: any) {
          return {
            previousEvents,
            message: "Something went wrong  while trying to delete event."
          };
        }
      },
      onError: (_err, _newTodo, context) => {
        toast.error(context.message);
        trpc.getEvents.utils.setData({ date: undefined }, () => context.previousEvents);
      },
      onSettled: (_data, _var, context) => {
        toast.success(context.message);
        trpc.getEvents.utils.invalidate();
      }
    });
  }
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

<QueryClientProvider client={queryClient}>
  <slot />
  <SvelteQueryDevtools buttonPosition="bottom-right" />
</QueryClientProvider>
