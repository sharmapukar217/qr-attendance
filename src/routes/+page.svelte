<script lang="ts">
  import { Dialog } from "bits-ui";
  import { selectedDate } from "$lib/stores";
  import { trpc } from "$lib/utilities/trpc-client";
  import Calendar from "$lib/components/Calendar.svelte";
  import EventInfo from "$lib/components/EventInfo.svelte";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import PinChecker from "$lib/components/PinChecker.svelte";
  import AddEventForm from "$lib/components/AddEventForm.svelte";
  import EventInfoSkeleton from "$lib/components/EventInfoSkeleton.svelte";

  let addEventDialogOpened = false;

  const allEvents = trpc.getEvents.query({ date: undefined });
  $: dates = new Set($allEvents.data?.map((d) => d.scheduledDate) ?? []);
  $: dateSpecificEvent = trpc.getEvents.query({ date: $selectedDate?.toString() });
</script>

<MainLayout title="Events" activeTab="events">
  <PinChecker />

  <div class="flex flex-col gap-8 lg:flex-row">
    <div class="lg:order-2 lg:ml-auto lg:w-1/3 p-3 rounded-lg border shadow-sm h-full">
      <Calendar bind:value={$selectedDate} datesToMark={dates} />

      <Dialog.Root bind:open={addEventDialogOpened}>
        <Dialog.Trigger asChild let:builder>
          <button
            {...builder}
            use:builder.action
            on:click={() => selectedDate.set(undefined)}
            class="
        mt-3 w-full flex items-center justify-center rounded-lg py-2.5 px-2
        bg-primary text-primary-foreground text-sm font-medium lg:font-semibold
        hover:bg-primary/85 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none">
            Add Event
          </button>
        </Dialog.Trigger>

        <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content
          class="fixed left-[50%] top-[50%] z-50 grid w-[90%] max-w-2xl max-h-[96%] overflow-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg lg:w-full">
          <div class="flex flex-col space-y-1.5 text-left">
            <h1 class="text-lg font-semibold leading-none tracking-tight">
              Add a new schedule
            </h1>
            <Dialog.Close
              class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
              <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
            </Dialog.Close>
          </div>

          <AddEventForm
            onSuccess={() => {
              addEventDialogOpened = false;
            }} />
        </Dialog.Content>
      </Dialog.Root>
    </div>

    <div
      class="lg:order-1 lg:w-2/3 space-y-3 max-lg:border-t max-lg:pt-8 lg:border-r lg:pr-8">
      <h1 class="text-foreground leading-6 font-semibold text-base">
        {#if !$selectedDate}
          Upcoming events
        {:else}
          Scheduled Events for {new Date($selectedDate.toString()).toLocaleDateString(
            "en-US",
            {
              dateStyle: "long"
            }
          )}
        {/if}
      </h1>

      <ol class="space-y-3">
        {#if $dateSpecificEvent.isError}
          <div class="text-center bg-background border rounded-xl px-4 py-3 shadow-sm">
            <h1 class="text-muted-foreground font-medium md:font-semibold">
              Oops! Something went wrong while loading events...
            </h1>
          </div>
        {:else if $dateSpecificEvent.data}
          {#if $dateSpecificEvent.data.length <= 0}
            <div class="text-center bg-background border rounded-xl px-4 py-3 shadow-sm">
              <h1 class="text-muted-foreground font-medium md:font-semibold">
                No schedules available to show...
              </h1>
            </div>
          {:else}
            {#each $dateSpecificEvent.data as event}
              <EventInfo {event} showDate={!$selectedDate} />
            {/each}
          {/if}
        {:else}
          {#each { length: Math.floor(Math.random() * 6) } as _}
            <EventInfoSkeleton />
          {/each}
        {/if}
      </ol>
    </div>
  </div>
</MainLayout>
