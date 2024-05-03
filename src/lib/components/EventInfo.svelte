<script lang="ts">
  import * as Form from "formsnap";
  import { DropdownMenu, Dialog } from "bits-ui";
  import type { RouterInput, RouterOutput } from "$lib/routers";
  import { createMutation } from "@tanstack/svelte-query";
  import { trpc } from "$lib/utilities/trpc-client";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { updateEventSchema } from "$lib/utilities/zod-schema";
  import DatePicker from "./DatePicker.svelte";
  import {
    type DateValue,
    today,
    getLocalTimeZone,
    CalendarDate
  } from "@internationalized/date";
  import { toast } from "svelte-sonner";
  import { twMerge } from "tailwind-merge";

  let editEventDialogOpened = false;
  export let showDate: boolean = true;
  export let event: RouterOutput["getEvents"][number];

  const date = new Date(event.scheduledDate);
  let scheduledDateValue: DateValue | undefined;
  const todayDate = new Date(new Date().toDateString());

  const eventQuery = trpc.getEventById.query(
    { eventId: event.id },
    {
      select(data) {
        return {
          ...data,
          attendees: data.attendees.map((aud) => aud.email).join(", ")
        };
      }
    }
  );

  $: if (editEventDialogOpened === true && $eventQuery.data?.scheduledDate) {
    const d = new Date($eventQuery.data.scheduledDate);
    scheduledDateValue = new CalendarDate(d.getFullYear(), d.getMonth(), d.getDay());
  }

  const deleteEventMutation = createMutation<any, any, RouterInput["deleteEvent"]>({
    mutationKey: ["deleteEvent"]
  });

  $: form = superForm(
    { ...$eventQuery?.data },
    {
      // SPA: true,
      validationMethod: "onblur",
      validators: zodClient(updateEventSchema),
      onResult({ result }) {
        if (result.type === "success") {
          if (!$eventQuery.data?.id) return;

          const eventId = $eventQuery.data.id;

          trpc.getEvents.utils.cancel();
          trpc.getEventById.utils.cancel({ eventId });

          trpc.getEvents.utils.invalidate({});
          trpc.getEventById.utils.invalidate({ eventId });
          toast.success("Event details updated successfully.");
        } else if (result.type === "error") {
          toast.error("Oops! Something went wrong while trying to update event details.");
          if (!$eventQuery.data?.id) return;
          trpc.getEventById.utils.invalidate({ eventId: $eventQuery.data.id });
        }
      }
    }
  );

  $: formData = form.form;
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

    <form
      method="post"
      use:form.enhance
      spellcheck="false"
      action="/?/updateEvent"
      class="gap-4 pt-4 px-1 pb-1 space-y-4 overflow-auto">
      <div class="w-full space-y-0.5">
        <Form.Field {form} name="title">
          <Form.Control let:attrs>
            <Form.Label
              class="text-sm font-medium text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[bi--fonts] w-5 h-5 me-2"></div>
              <div>Schedule Title</div>
            </Form.Label>
            <input
              {...attrs}
              type="text"
              name="title"
              bind:value={$formData.title}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
            focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
            aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter title for the schedule" />

            <Form.FieldErrors class="text-sm text-destructive" />
          </Form.Control>
        </Form.Field>
      </div>

      <input type="hidden" id="id" name="id" bind:value={$formData.id} />
      <div class="w-full space-y-0.5">
        <Form.Field {form} name="scheduledDate">
          <Form.Control let:attrs>
            <Form.Label
              class="text-sm font-medium text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--calendar-days] w-5 h-5 me-2"></div>
              <div>Schedule Date</div>
            </Form.Label>

            <DatePicker
              {...attrs}
              showCalendarIcon={false}
              value={scheduledDateValue}
              minValue={today(getLocalTimeZone())}
              placeholder="Enter the date for the schedule"
              classes={{
                popover: "max-md:ml-2",
                trigger: [
                  "block w-full text-start !ring-offset-0",
                  attrs["aria-invalid"]
                    ? "!ring-destructive text-destructive border border-destructive"
                    : ""
                ]
              }}
              onValueChange={function (v) {
                formData.set({ ...$formData, scheduledDate: v?.toString() ?? "" });
              }} />

            <Form.FieldErrors class="text-sm text-destructive" />

            <div class="inline-flex items-center space-x-2 py-2">
              <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
              <button
                type="button"
                on:click={() => {
                  scheduledDateValue = today(getLocalTimeZone());
                  formData.set({
                    ...$formData,
                    scheduledDate: scheduledDateValue.toString()
                  });
                }}
                class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
            hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background">
                Today
              </button>
            </div>
          </Form.Control>
        </Form.Field>
      </div>

      <div class="w-full space-y-0.5">
        <Form.Field {form} name="scheduledTime">
          <Form.Control let:attrs>
            <Form.Label
              class="text-sm font-medium text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--map-pin] w-5 h-5 me-2"></div>
              <div>Time</div>
            </Form.Label>
            <input
              {...attrs}
              type="text"
              name="scheduledTime"
              bind:value={$formData.scheduledTime}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
              focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
              aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter the time for the schedule" />
            <Form.FieldErrors class="text-sm text-destructive" />

            <div class="inline-flex items-center space-x-2 py-2">
              <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
              <button
                type="button"
                on:click={() => {
                  $formData.scheduledTime = "ALL DAY";
                }}
                class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
            hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background">
                All Day
              </button>
            </div>
          </Form.Control>
        </Form.Field>
      </div>

      <div class="w-full space-y-0.5">
        <Form.Field {form} name="scheduledLocation">
          <Form.Control let:attrs>
            <Form.Label
              class="text-sm font-medium text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--map-pin] w-5 h-5 me-2"></div>
              <div>Location</div>
            </Form.Label>

            <input
              {...attrs}
              name="scheduledLocation"
              bind:value={$formData.scheduledLocation}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
              focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
              aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter location for the schedule" />
            <Form.FieldErrors class="text-sm text-destructive" />

            <div class="inline-flex items-center space-x-2 py-2">
              <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
              <button
                type="button"
                class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
            hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
                on:click={() => {
                  $formData.scheduledLocation = "REMOTE";
                }}>
                Remote
              </button>

              <button
                type="button"
                class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
            focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
                on:click={() => {
                  $formData.scheduledLocation = "OFFICE";
                }}>
                Office
              </button>
            </div>
          </Form.Control>
        </Form.Field>
      </div>

      <div class="w-full space-y-0.5">
        <Form.Field {form} name="scheduledLocation">
          <Form.Control let:attrs>
            <Form.Label
              class="text-sm font-medium text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--calendar-days] w-5 h-5 me-2"></div>
              <div>Attendees</div>
            </Form.Label>
            <textarea
              rows={4}
              {...attrs}
              name="attendees"
              bind:value={$formData.attendees}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
              focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
              aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter emails of attendees, comma separated" />
            <Form.FieldErrors class="text-sm text-destructive" />

            <small class="text-muted-foreground text-xs">
              Comma separated list of emails.
            </small>

            <small class="text-muted-foreground text-xs">
              An invitation email would be sent to newly added emails.
            </small>
          </Form.Control>
        </Form.Field>
      </div>

      <button
        type="submit"
        class="
      text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2 w-full lg:w-auto
      hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none">
        Submit
      </button>
    </form>
  </Dialog.Content>
</Dialog.Root>
