<script lang="ts">
  import { Dialog } from "bits-ui";
  import * as Form from "formsnap";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { type DateValue, today, getLocalTimeZone } from "@internationalized/date";

  import Calendar from "$lib/components/Calendar.svelte";
  import EventInfo from "$lib/components/EventInfo.svelte";
  import { addEventSchema } from "$lib/utilities/zod-schema";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import DatePicker from "$lib/components/DatePicker.svelte";
  import { trpc } from "$lib/utilities/trpc-client.js";
  import EventInfoSkeleton from "$lib/components/EventInfoSkeleton.svelte";
  import PinChecker from "$lib/components/PinChecker.svelte";

  export let data;
  let date: DateValue;

  let addEventDialogOpened = false;
  let scheduledDateValue: DateValue | undefined;

  const form = superForm(data.addEventForm, {
    validators: zodClient(addEventSchema),
    validationMethod: "onblur",
    onSubmit() {
      toast.loading("Please wait while loading...", {
        duration: Infinity,
        id: "add-event"
      });
    },

    onResult({ result }) {
      if (result.type === "success") {
        addEventDialogOpened = false;
        trpc.getEvents.utils.cancel();
        trpc.getEvents.utils.setData({ date: undefined }, (old) => {
          const newData = {
            id: Date.now(),
            ...$formData,
            createdAt: new Date().toString(),
            audiences: $formData.audiences.split(",").filter((v) => !!v).length
          };

          if (!old) return [newData];
          return [...old, newData];
        });

        toast.success("Event added successfully!", { id: "add-event" });
        trpc.getEvents.utils.invalidate();
      } else if (result.type === "error") {
        toast.error("Something went wrong while trying to add new event!", {
          id: "add-event"
        });
      }
    }
  });

  const { form: formData, submitting } = form;

  const allEvents = trpc.getEvents.query({ date: undefined });
  $: dates = new Set($allEvents.data?.map((d) => d.scheduledDate) ?? []);
  $: dateSpecificEvent = trpc.getEvents.query({ date: date?.toString() });
</script>

<MainLayout title="Events" activeTab="events">
  <PinChecker />

  <div class="flex flex-col gap-8 lg:flex-row">
    <div class="lg:order-2 lg:ml-auto lg:w-1/3 p-3 rounded-lg border shadow-sm">
      <Calendar bind:value={date} datesToMark={dates} />

      <Dialog.Root bind:open={addEventDialogOpened}>
        <Dialog.Trigger
          class="
        mt-2.5 w-full flex items-center justify-center rounded-lg py-2.5 px-2
        bg-primary text-primary-foreground text-sm font-medium lg:font-semibold
        hover:bg-primary/85 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none">
          Add Event
        </Dialog.Trigger>

        <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content
          class="fixed left-[50%] top-[50%] z-50 grid w-[90%] max-w-lg max-h-[96%] overflow-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg lg:w-full">
          <div class="flex flex-col space-y-1.5 text-left">
            <h1 class="text-lg font-semibold leading-none tracking-tight">
              Add a new schedule
            </h1>
            <Dialog.Close
              class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
              <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
            </Dialog.Close>
          </div>

          <form
            method="post"
            action="/?/addEvent"
            class="gap-4 pt-4 px-1 pb-1 space-y-4 overflow-auto"
            use:form.enhance>
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
                    bind:value={scheduledDateValue}
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
                    <div class="text-xs font-medium text-muted-foreground my-auto">
                      Help:
                    </div>
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
                    <div class="text-xs font-medium text-muted-foreground my-auto">
                      Help:
                    </div>
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
                    <div class="text-xs font-medium text-muted-foreground my-auto">
                      Help:
                    </div>
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
                    <div>Audiences</div>
                  </Form.Label>
                  <textarea
                    rows={4}
                    {...attrs}
                    name="audiences"
                    bind:value={$formData.audiences}
                    class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                    focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                    aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
                    placeholder="Enter emails of audiences, comma separated" />
                  <Form.FieldErrors class="text-sm text-destructive" />

                  <small class="text-muted-foreground text-xs">
                    Comma separated list of emails
                  </small>
                </Form.Control>
              </Form.Field>
            </div>

            <button
              disabled={$submitting}
              type="submit"
              class="
              text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2 w-full lg:w-auto
              hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-90">
              {$submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>

    <div
      class="lg:order-1 lg:w-2/3 space-y-3 max-lg:border-t max-lg:pt-8 lg:border-r lg:pr-8">
      <h1 class="text-foreground leading-6 font-semibold text-base">
        {#if !date}
          Upcoming events
        {:else}
          Scheduled Events for {new Date(date.toString()).toLocaleDateString("en-US", {
            dateStyle: "long"
          })}
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
              <EventInfo {event} showDate={!date} />
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
