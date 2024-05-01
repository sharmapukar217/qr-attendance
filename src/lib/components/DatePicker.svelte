<script lang="ts">
  import { Popover } from "bits-ui";
  import { twMerge } from "tailwind-merge";
  import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone
  } from "@internationalized/date";
  import type { Calendar as CalendarPrimitive } from "bits-ui";
  import Calendar from "./Calendar.svelte";

  type ClassValues = {
    trigger?: string | string[];
    popover?: string | string[];
  };

  export let id: string;
  export let name: string | undefined = id;
  export let value: DateValue | undefined = undefined;
  export let placeholder: string | undefined = "Select a date";

  export let showCalendarIcon: boolean = true;
  export let datesToMark: Set<string> = new Set();
  export let classes: ClassValues | undefined = undefined;
  export let onValueChange: CalendarPrimitive.Props["onValueChange"] = undefined;

  export let minValue: CalendarPrimitive.Props["minValue"] = undefined;
  export let maxValue: CalendarPrimitive.Props["maxValue"] = undefined;

  let inputRef: HTMLInputElement | undefined;

  const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });
</script>

<input type="hidden" {id} {name} bind:this={inputRef} {...$$restProps} />

<Popover.Root>
  <Popover.Trigger
    class={twMerge(
      "inline-flex items-center justify-center text-sm font-medium md:font-semibold bg-background text-muted-foreground border rounded-lg px-3 h-10 focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-background",
      classes?.trigger
    )}>
    {#if showCalendarIcon}
      <div class="shrink-0 icon-[heroicons--calendar-days] w-4 h-4 me-2 mb-[1px]"></div>
    {/if}
    {value ? df.format(value.toDate(getLocalTimeZone())) : placeholder}
  </Popover.Trigger>
  <Popover.Content
    align="end"
    sideOffset={5}
    class={twMerge(
      "z-50 w-72 rounded-md border bg-background px-3 py-3 text-foreground shadow outline-none",
      classes?.popover
    )}>
    <Calendar
      bind:value
      {minValue}
      {maxValue}
      {datesToMark}
      onValueChange={(v) => {
        onValueChange?.(v);

        if (!inputRef || !v) return;
        inputRef.value = v.toString();
      }} />
  </Popover.Content>
</Popover.Root>
