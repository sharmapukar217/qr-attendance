<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import { DropdownMenu, Dialog } from "bits-ui";
  import { createMutation } from "@tanstack/svelte-query";

  import { trpc } from "$lib/utilities/trpc-client";
  import UpdateEventForm from "./UpdateEventForm.svelte";
  import type { RouterInput, RouterOutput } from "$lib/routers";

  let editEventDialogOpened = false;
  export let showDate: boolean = true;
  export let event: RouterOutput["getEvents"][number];

  const date = new Date(event.scheduledDate);
  const todayDate = new Date(new Date().toDateString());
  const eventQuery = trpc.getEventById.query({ eventId: event.id });
  const deleteEventMutation = createMutation<any, any, RouterInput["deleteEvent"]>({
    mutationKey: ["deleteEvent"]
  });
</script>

<li
  class={twMerge(
    "flex flex-col space-y-2 bg-background border rounded-xl px-4 py-3 shadow-sm",
    !event.createdAt && "border-foreground/30 animate-pulse"
  )}>
  <div class="text-left inline-flex items-start">
    <h2 class="text-md font-medium lg:font-semibold">
      {event.title}
    </h2>

    {#if date >= todayDate}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="ml-auto text-muted-foreground hover:text-foreground w-2/12 text-end focus:outline-none">
          <div class="icon-[heroicons--ellipsis-horizontal-solid] w-5 h-5"></div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          align="end"
          class="z-50 min-w-[8rem] rounded-md border bg-background p-1 text-foreground shadow-md focus:outline-none">
          <DropdownMenu.Item asChild let:builder>
            <button
              {...builder}
              use:builder.action
              on:click={() => {
                editEventDialogOpened = true;
              }}
              class="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:opacity-50">
              <div class="icon-[heroicons--pencil-square] w-4 h-4 me-3"></div>
              <div>Edit</div>
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            on:click={() => {
              if (!confirm("Do you really want to delete this event?")) return;
              $deleteEventMutation.mutate({ eventId: event.id });
            }}
            class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground data-[disabled]:opacity-50">
            <div class="icon-[heroicons--trash] w-4 h-4 me-3"></div>
            <div>Delete</div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  </div>

  <div class="text-muted-foreground inline-flex items-center">
    <div class="me-2 icon-[heroicons--calendar-days-solid] w-5 h-5"></div>
    <div class="text-sm mt-0.5 font-medium md:font-semibold">
      {#if showDate}
        {date.toLocaleDateString("en-US", { dateStyle: "long" })} -
      {/if}
      {event.scheduledTime}
    </div>
  </div>

  <div
    class="text-muted-foreground inline-flex items-center font-medium md:font-semibold">
    <div class="me-2 icon-[heroicons--map-pin-solid] w-5 h-5"></div>
    <div class="text-sm mt-0.5">
      {event.scheduledLocation} - {event.attendees} people invited
    </div>
  </div>
</li>

<Dialog.Root
  bind:open={editEventDialogOpened}
  onOpenChange={function (open) {
    if (open) {
    }
  }}>
  <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />

  <Dialog.Content
    class="fixed left-[50%] top-[50%] z-50 grid w-[90%] max-w-lg max-h-[96%] overflow-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg lg:w-full">
    <div class="flex flex-col space-y-1.5 text-left">
      <div>
        <h1 class="text-lg font-semibold leading-none tracking-tight">Edit event info</h1>
        {#if $eventQuery.data?.title}
          <small class="font-medium md:font-semibold text-muted-foreground">
            {$eventQuery.data.title}
          </small>
        {:else}
          <div class="w-32 py-2 bg-muted-foreground/30 animate-pulse mt-2 rounded-sm">
          </div>
        {/if}
      </div>
      <Dialog.Close
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
        <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
      </Dialog.Close>
    </div>

    <UpdateEventForm
      event={$eventQuery.data}
      onSuccess={() => {
        editEventDialogOpened = false;
      }} />
  </Dialog.Content>
</Dialog.Root>
