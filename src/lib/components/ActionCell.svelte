<script lang="ts">
  import { toast } from "svelte-sonner";
  import { twMerge } from "tailwind-merge";
  import { Tooltip, Dialog } from "bits-ui";
  import type { RouterOutput } from "$lib/routers";
  import { trpc } from "$lib/utilities/trpc-client";

  export let allowAttendance: boolean;
  export let audience: RouterOutput["getAudiences"][number] | undefined;

  const updateStatusMutation = trpc.setAttendeeStatus.mutation({
    onMutate({ status }) {
      toast.success(`Status updated to \`${status}\` for ${audience?.email}`);
    },
    onSettled() {
      if (audience?.eventId) {
        trpc.getAudiences.utils.invalidate({ eventId: audience.eventId });
      }
    }
  });
</script>

<!-- <Dialog.Root>
  <Dialog.Trigger
    title="Start Scanner"
    class="md:ml-auto bg-primary text-sm font-semibold text-primary-foreground inline-flex items-center justify-center rounded-lg py-2.5 px-3
focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background hover:bg-primary/85">
    <div class="icon-[heroicons--qr-code] h-4 w-4" />
    <p class="hidden md:inline md:ms-3">Start Scanner</p>
  </Dialog.Trigger>

  <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
  <Dialog.Content
    class="fixed left-[2%] max-w-xl md:left-1/2 top-1/2 z-50 w-[90%] lg:w-full h-[96%] md:-translate-x-1/2 -translate-y-1/2 border bg-background shadow-lg rounded-lg flex flex-col">
    <div
      class="flex flex-row items-center space-y-1.5 text-left px-4 py-4 border-b">
      <h1 class="text-lg font-semibold leading-none tracking-tight">QR Scanner</h1>
      <Dialog.Close
        class="ml-auto rounded-sm opacity-70 transition-all hover:opacity-100 hover:text-destructive">
        <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
      </Dialog.Close>
    </div>

    <div class="h-full px-4 py-4"></div>
    <div
      class="border-t text-sm font-medium md:font-semibold text-muted-foreground text-center py-1">
      Made with ❤️ by <a href="/" class="text-primary hover:underline">
        hyperce.io
      </a>
    </div>
  </Dialog.Content>
</Dialog.Root> -->

{#if audience}
  <div class="inline-flex items-center space-x-2">
    <!-- <Dialog.Root>
      <Dialog.Trigger asChild let:builder={dialogBuilder}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder={tooltioBuilder}>
            <button
              {...dialogBuilder}
              {...tooltioBuilder}
              use:dialogBuilder.action
              use:tooltioBuilder.action
              class="inline-flex items-center justify-center bg-muted text-muted-foreground px-2 py-1 rounded-md border focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none">
              <i class="icon-[heroicons--pencil-square] w-4 h-4" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content
            side="right"
            sideOffset={10}
            class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
            Edit
          </Tooltip.Content>
        </Tooltip.Root>
      </Dialog.Trigger>

      <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />

      <Dialog.Content
        class="fixed left-[2%] max-w-xl md:left-1/2 top-1/2 z-50 w-[90%] lg:w-full h-[96%] md:-translate-x-1/2 -translate-y-1/2 border bg-background shadow-lg rounded-lg flex flex-col">
        <div class="flex flex-row items-center space-y-1.5 text-left px-4 py-4 border-b">
          <h1 class="text-lg font-semibold leading-none tracking-tight">QR Scanner</h1>
          <Dialog.Close
            class="ml-auto rounded-sm opacity-70 transition-all hover:opacity-100 hover:text-destructive">
            <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
          </Dialog.Close>
        </div>

        <div class="h-full px-4 py-4"></div>
        <div
          class="border-t text-sm font-medium md:font-semibold text-muted-foreground text-center py-1">
          Made with ❤️ by <a href="/" class="text-primary hover:underline">
            hyperce.io
          </a>
        </div>
      </Dialog.Content>
    </Dialog.Root> -->

    {#if allowAttendance}
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <button
            {...builder}
            use:builder.action
            on:click={() => {
              $updateStatusMutation.mutate({
                audienceId: audience.id,
                eventId: audience.eventId,
                status: audience.status === "present" ? "absent" : "present"
              });
            }}
            class={twMerge(
              "inline-flex items-center justify-center bg-muted text-muted-foreground px-2 py-1 rounded-md border focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:outline-none transition-all duration-100",
              audience.status === "present" && "text-green-500 ring-green-500",
              audience.status === "absent" && "text-red-500 ring-red-500"
            )}>
            <i
              class="w-4 h-4"
              class:icon-[bi--toggle-off]={audience.status !== "present"}
              class:icon-[bi--toggle-on]={audience.status === "present"} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
          Set to {audience.status === "present" ? "Absent" : "Present"}
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
  </div>
{/if}
