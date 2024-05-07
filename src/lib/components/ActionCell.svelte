<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { twMerge } from "tailwind-merge";
  import { createMutation } from "@tanstack/svelte-query";
  import type { RouterOutput, RouterInput } from "$lib/routers";

  export let allowAttendance: boolean;
  export let attendee: RouterOutput["getAttendees"][number] | undefined;

  const setAttendeeStatus = createMutation<
    RouterOutput["getAttendees"],
    unknown,
    RouterInput["setAttendeeStatus"]
  >({ mutationKey: ["setAttendeeStatus"] });
</script>

{#if attendee}
  <div class="inline-flex items-center space-x-2">
    {#if allowAttendance}
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <button
            {...builder}
            use:builder.action
            on:click={() => {
              $setAttendeeStatus.mutate({
                name: attendee.name,
                attendeeId: attendee.id,
                eventId: attendee.eventId,
                status: attendee.status === "present" ? "absent" : "present"
              });
            }}
            class={twMerge(
              "inline-flex items-center justify-center bg-muted text-muted-foreground px-2 py-1 rounded-md border focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:outline-none transition-all duration-100",
              attendee.status === "present" && "text-green-500 ring-green-500",
              attendee.status === "absent" && "text-red-500 ring-red-500"
            )}>
            <i
              class="w-4 h-4"
              class:icon-[bi--toggle-off]={attendee.status !== "present"}
              class:icon-[bi--toggle-on]={attendee.status === "present"} />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
          Set to {attendee.status === "present" ? "Absent" : "Present"}
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
  </div>
{/if}
