<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { createForm } from "felte";
  import DatePicker from "./DatePicker.svelte";
  import { validator } from "@felte/validator-zod";
  import { createMutation } from "@tanstack/svelte-query";
  import type { DateValue } from "@internationalized/date";
  import { addEventSchema } from "$lib/utilities/zod-schema";
  import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
  import type { RouterInput, RouterOutput } from "$lib/routers";
  import { twMerge } from "tailwind-merge";

  let scheduledDateValue: DateValue | undefined;

  export let event: RouterOutput["getEventById"] | undefined = undefined;

  export let onError: (() => void) | undefined = undefined;
  export let onSuccess: (() => void) | undefined = undefined;

  const removeAttendeeMutation = createMutation<
    RouterOutput["removeAttendeeFromEvent"],
    unknown,
    RouterInput["removeAttendeeFromEvent"]
  >({
    mutationKey: ["removeAttendeeFromEvent"]
  });

  const resendInvitationMutation = createMutation<
    RouterOutput["resendInvitation"],
    unknown,
    RouterInput["resendInvitation"]
  >({
    mutationKey: ["resendInvitation"]
  });

  const updateEventMutation = createMutation<
    RouterOutput["updateEvent"],
    unknown,
    RouterInput["updateEvent"]
  >({
    onSettled(data, err) {
      if (err) {
        onError?.();
      } else {
        onSuccess?.();
      }
    },
    mutationKey: ["updateEvent"]
  });

  const { form, errors, setInitialValues, touched, data, isDirty, setIsDirty } =
    createForm({
      initialValues: {
        title: "",
        id: undefined,
        scheduledDate: "",
        scheduledTime: "",
        scheduledLocation: "",
        attendees: [{ id: undefined, name: "", phoneNumber: "" }]
      },
      extend: validator({ schema: addEventSchema }),
      onSubmit(data) {
        if (!event?.id) return;
        $updateEventMutation.mutate(data);
      }
    });

  // @ts-ignore
  $: if (event) setInitialValues(event as any);
</script>

<form use:form method="post" class="gap-4 pt-4 px-1 pb-1 space-y-4 overflow-auto">
  <input type="hidden" name="id" id="id" bind:value={$data.id} />
  <div class="w-full space-y-0.5">
    <label
      for="title"
      class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
      <div class="icon-[bi--fonts] w-5 h-5 me-2"></div>
      <div>Schedule Title <sup class="text-destructive font-semibold">*</sup></div>
    </label>
    <input
      required
      id="title"
      type="text"
      name="title"
      bind:value={$data.title}
      class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
      focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
      aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
      placeholder="Enter title for the schedule" />
    {#if $errors.title}
      <small class="block text-destructive text-sm font-medium md:font-semibold">
        {$errors.title}
      </small>
    {/if}
  </div>

  <div class="w-full space-y-0.5">
    <label
      for="scheduledDate"
      class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
      <div class="icon-[heroicons--calendar-days] w-5 h-5 me-2"></div>
      <div>Schedule Date <sup class="text-destructive font-semibold">*</sup></div>
    </label>

    <DatePicker
      required
      id="scheduledDate"
      showCalendarIcon={false}
      rawValue={event?.scheduledDate}
      bind:value={scheduledDateValue}
      minValue={today(getLocalTimeZone())}
      placeholder="Enter the date for the schedule"
      classes={{
        popover: "max-md:ml-2",
        trigger: [
          "block w-full text-start focus:ring-offset-0 focus:ring-primary",
          $errors.scheduledDate ? "ring-1  ring-destructive focus:ring-destructive" : ""
        ]
      }}
      onValueChange={function (v) {
        if (!v) return;
        $data.scheduledDate = v?.toString();
      }} />

    <div class="inline-flex items-center space-x-2 py-2">
      <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
      <button
        type="button"
        on:click={() => {
          setIsDirty(true);
          scheduledDateValue = today(getLocalTimeZone());
          $data.scheduledDate = scheduledDateValue.toString();
        }}
        class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background">
        Today
      </button>

      {#if event && event.scheduledDate !== $data.scheduledDate}
        <button
          type="button"
          class="flex items-center justify-center text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
          on:click={() => {
            const date = new Date(event.scheduledDate);
            scheduledDateValue = new CalendarDate(
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate()
            );
            $data.scheduledDate = event.scheduledDate;
            setIsDirty(true);
          }}>
          <div class="icon-[bi--arrow-counterclockwise] w-4 h-4" />
        </button>
      {/if}
    </div>

    {#if $errors.scheduledDate}
      <small class="block text-destructive text-sm font-medium md:font-semibold">
        {$errors.scheduledDate}
      </small>
    {/if}
  </div>

  <div class="w-full space-y-0.5">
    <label
      for="scheduledTime"
      class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
      <div class="icon-[heroicons--map-pin] w-5 h-5 me-2"></div>
      <div>Scheduled Time <sup class="text-destructive font-semibold">*</sup></div>
    </label>
    <input
      type="text"
      id="scheduledTime"
      name="scheduledTime"
      bind:value={$data.scheduledTime}
      class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
            focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
            aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
      placeholder="Enter the time for the schedule" />

    <div class="inline-flex items-center space-x-2 py-2">
      <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
      <button
        type="button"
        on:click={() => {
          $data.scheduledTime = "ALL DAY";
          setIsDirty(true);
        }}
        class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background">
        All Day
      </button>

      {#if event && event.scheduledTime !== $data.scheduledTime}
        <button
          type="button"
          class="flex items-center justify-center text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
          on:click={() => {
            $data.scheduledTime = event.scheduledTime;
            setIsDirty(true);
          }}>
          <div class="icon-[bi--arrow-counterclockwise] w-4 h-4" />
        </button>
      {/if}
    </div>

    {#if $errors.scheduledTime}
      <small class="block text-destructive text-sm font-medium md:font-semibold">
        {$errors.scheduledTime}
      </small>
    {/if}
  </div>

  <div class="w-full space-y-0.5">
    <label
      for="scheduledLocation"
      class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
      <div class="icon-[heroicons--map-pin] w-5 h-5 me-2"></div>
      <div>Location <sup class="text-destructive font-semibold">*</sup></div>
    </label>

    <input
      id="scheduledLocation"
      name="scheduledLocation"
      bind:value={$data.scheduledLocation}
      class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
            focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
            aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
      placeholder="Enter location for the schedule" />

    <div class="inline-flex items-center space-x-2 py-2">
      <div class="text-xs font-medium text-muted-foreground my-auto">Help:</div>
      <button
        type="button"
        class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          hover:bg-muted/85 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
        on:click={() => {
          $data.scheduledLocation = "REMOTE";
          setIsDirty(true);
        }}>
        Remote
      </button>

      <button
        type="button"
        class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
        on:click={() => {
          $data.scheduledLocation = "OFFICE";
          setIsDirty(true);
        }}>
        Office
      </button>

      {#if event && event.scheduledLocation !== $data.scheduledLocation}
        <button
          type="button"
          class="flex items-center justify-center text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg
          focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background"
          on:click={() => {
            $data.scheduledLocation = event.scheduledLocation;
            setIsDirty(true);
          }}>
          <div class="icon-[bi--arrow-counterclockwise] w-4 h-4" />
        </button>
      {/if}
    </div>

    {#if $errors.scheduledLocation}
      <small class="block text-destructive text-sm font-medium md:font-semibold">
        {$errors.scheduledLocation}
      </small>
    {/if}
  </div>

  <hr class="border border-foreground/15" />

  <strong
    class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center">
    Attendees
  </strong>

  {#if $data.attendees?.length}
    {#each $data.attendees as _aud, idx}
      <div class="gap-4 grid">
        <div class="flex items-baseline pb-2 space-x-2">
          <srong class="font-semibold text-muted-foreground">{idx + 1}</srong>
          <div class="h-0.5 w-full border-t-[3px] border-dashed border-foreground/15">
          </div>
        </div>
        <div>
          <label
            for="attendees.{idx}.name"
            class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
            <div class="icon-[heroicons--user] w-5 h-5 me-2"></div>
            <div>Name <sup class="text-destructive font-semibold">*</sup></div>
          </label>

          <div class="flex items-center">
            <input
              type="text"
              id="attendees.{idx}.name"
              name="attendees.{idx}.name"
              bind:value={$data.attendees[idx].name}
              class="block border w-7/12 lg:9/12 rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
              focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
              aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter the name of the attendee" />

            <div class="inline-flex items-center ml-auto gap-2.5">
              <!-- {#if event?.attendees[idx]}
                {@const wasEmailSent = event.attendees[idx].emailSent === 1}
                <Tooltip.Root>
                  <Tooltip.Trigger asChild let:builder>
                    <button
                      {...builder}
                      use:builder.action
                      type="button"
                      disabled={wasEmailSent || $resendInvitationMutation.isPending}
                      on:click={() => {
                        if (!event?.attendees?.[idx]) return;

                        if (!wasEmailSent && confirm("Sure to retry sending email?")) {
                          $resendInvitationMutation.mutate({
                            eventId: event.id,
                            email: event.attendees[idx].email,
                            attendeeId: event.attendees[idx].id,
                            name: event.attendees[idx].name,
                            phoneNumber: event.attendees[idx].phoneNumber
                          });
                        }
                      }}
                      class={twMerge(
                        "cursor-pointer ml-auto size-10 rounded-lg flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-85",
                        wasEmailSent &&
                          "bg-foreground/5 border border-foreground/10 text-green-500",

                        !wasEmailSent &&
                          !$resendInvitationMutation.isPending &&
                          "bg-foreground/5 border border-foreground/10 text-destructive focus:ring-destructive/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",

                        !wasEmailSent &&
                          $resendInvitationMutation.isPending &&
                          "text-muted-foreground focus:ring-muted"
                      )}>
                      <div
                        class="size-5"
                        class:icon-[bi--check-all]={wasEmailSent}
                        class:icon-[heroicons--exclamation-triangle]={!wasEmailSent &&
                          !$resendInvitationMutation.isPending}
                        class:icon-[bi--arrow-repeat]={$resendInvitationMutation.isPending} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    align="end"
                    side="bottom"
                    sideOffset={10}
                    class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
                    {wasEmailSent ? "Email sent successfully!" : "Retry sending email?"}
                  </Tooltip.Content>
                </Tooltip.Root>
              {/if} -->

              {#if $data.attendees.length > 1}
                <Tooltip.Root>
                  <Tooltip.Trigger asChild let:builder>
                    <button
                      {...builder}
                      use:builder.action
                      type="button"
                      on:click={() => {
                        const attendeeId = $data.attendees?.[idx]?.id;

                        if (attendeeId && event?.id) {
                          if (confirm("Sure to remove this attendee?")) {
                            $removeAttendeeMutation.mutate({
                              attendeeId,
                              eventId: event.id
                            });
                            $data.attendees = $data.attendees.filter(
                              (_a, i) => i !== idx
                            );
                          }
                        } else {
                          if (
                            (!attendeeId && !$touched.attendees[idx].name) ||
                            confirm("Sure to remove this attendee?")
                          ) {
                            $data.attendees = $data.attendees.filter(
                              (_a, i) => i !== idx
                            );
                          }
                        }
                      }}
                      class="cursor-pointer ml-auto bg-foreground/5 border border-foreground/10 text-destructive focus:ring-destructive/50
                      size-10 rounded-lg flex items-center justify-center focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background">
                      <div class="icon-[bi--person-x] size-5" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    align="end"
                    side="bottom"
                    sideOffset={10}
                    class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
                    Remove from the list
                  </Tooltip.Content>
                </Tooltip.Root>
              {/if}
            </div>
          </div>

          {#if $errors.attendees?.[idx]?.name}
            <small class="block text-destructive text-sm font-medium md:font-semibold">
              {$errors.attendees?.[idx]?.name}
            </small>
          {/if}
        </div>

        <div class="flex flex-col md:flex-row gap-4">
          <!-- <div>
            <label
              for="attendees.{idx}.email"
              class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--at-symbol] w-5 h-5 me-2"></div>
              <div>Email Address <sup class="text-destructive font-semibold">*</sup></div>
            </label>
            <input
              required
              type="email"
              id="attendees.{idx}.email"
              name="attendees.{idx}.email"
              bind:value={$data.attendees[idx].email}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
          focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
          aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter the email of the attendee" />
            {#if $errors.attendees?.[idx]?.email}
              <small class="block text-destructive text-sm font-medium md:font-semibold">
                {$errors.attendees?.[idx]?.email}
              </small>
            {/if}
          </div> -->

          <div>
            <label
              for="attendees.{idx}.phoneNumber"
              class="text-sm font-medium md:font-semibold text-muted-foreground inline-flex items-center cursor-pointer">
              <div class="icon-[heroicons--phone] w-5 h-5 me-2"></div>
              <div>Phone Number <small class="text-xs">(Optional)</small></div>
            </label>
            <input
              type="phoneNumber"
              id="attendees.{idx}.phoneNumber"
              name="attendees.{idx}.phoneNumber"
              bind:value={$data.attendees[idx].phoneNumber}
              class="border w-full rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
          focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
          aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive"
              placeholder="Enter the phone number of the attendee" />
            {#if $errors.attendees?.[idx]?.phoneNumber}
              <small class="block text-destructive text-sm font-medium md:font-semibold">
                {$errors.attendees?.[idx]?.phoneNumber}
              </small>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  {/if}

  <button
    on:click={() => {
      $data.attendees = [
        ...$data.attendees,
        {
          name: "",
          id: undefined,
          phoneNumber: "",
          key: String($data.attendees.length + 1)
        }
      ];
      setIsDirty(true);
    }}
    type="button"
    class="
    block text-sm font-semibold bg-muted text-muted-foreground rounded-lg px-4 py-2
    hover:bg-muted/90 focus:ring-2 focus:ring-offset-2 focus:ring-muted focus:ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-90">
    Add Attendee ({$data.attendees.length})
  </button>

  <hr class="border border-foreground/15" />
  <button
    type="submit"
    disabled={!$isDirty}
    class="
      text-sm font-semibold bg-primary text-primary-foreground rounded-lg px-4 py-2 w-full lg:w-auto
      hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-90">
    Submit
  </button>
</form>
