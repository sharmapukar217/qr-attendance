<script lang="ts">
  import { Calendar } from "bits-ui";
  import { twJoin } from "tailwind-merge";

  type $$Props = Calendar.Props & {
    datesToMark?: Set<string>;
  };
  type $$Events = Calendar.Events;

  export let value: $$Props["value"] = undefined;
  export let datesToMark: $$Props["datesToMark"] = undefined;
  export let placeholder: $$Props["placeholder"] = undefined;
</script>

<Calendar.Root
  on:keydown
  let:months
  let:weekdays
  fixedWeeks={true}
  bind:value
  bind:placeholder
  weekdayFormat="narrow"
  {...$$restProps}>
  <!-- calendar header -->
  <Calendar.Header class="relative flex w-full items-center justify-between pt-1">
    <Calendar.PrevButton
      class="flex items-center justify-center h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
      <div class="icon-[heroicons--chevron-left-solid] h-5 w-5"></div>
    </Calendar.PrevButton>

    <Calendar.Heading class="text-sm font-medium md:font-semibold" />

    <Calendar.NextButton
      class="flex items-center justify-center h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
      <div class="icon-[heroicons--chevron-right-solid] h-5 w-5"></div>
    </Calendar.NextButton>
  </Calendar.Header>

  <!-- calendar days -->
  <div class="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
    {#each months as month}
      <Calendar.Grid class="w-full  space-y-1">
        <!-- calendar grid head -->
        <Calendar.GridHead>
          <Calendar.GridRow class="flex mb-2">
            {#each weekdays as day}
              <Calendar.HeadCell
                class="min-w-8 w-full text-center rounded-md text-[0.8rem] font-medium md:font-semibold text-muted-foreground">
                <div>{day.slice(0, 2)}</div>
              </Calendar.HeadCell>
            {/each}
          </Calendar.GridRow>
        </Calendar.GridHead>

        <!-- calendar grid body -->
        <Calendar.GridBody>
          {#each month.weeks as weekDates}
            <Calendar.GridRow
              class="flex w-full first:border border-x border-b first:rounded-t-lg last:rounded-b-lg last:border last:border-t-0 divide-x">
              {#each weekDates as date}
                <Calendar.Cell
                  {date}
                  class=" w-full relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50">
                  <Calendar.Day
                    {date}
                    month={month.value}
                    class={twJoin(
                      "group min-h-11 min-w-8 w-full p-0 font-medium md:font-semibold hover:bg-muted flex items-center justify-center",
                      // Today
                      "[&[data-today]:not([data-selected])]:bg-background [&[data-today]:not([data-selected])]:text-primary",
                      // Selected
                      "data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:opacity-100",
                      // Disabled
                      "data-[disabled]:text-muted-foreground data-[disabled]:bg-muted data-[disabled]:opacity-50",
                      // Unavailable
                      "data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through",
                      // Outside months
                      "data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-muted/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30"
                    )}>
                    <div
                      class="z-50 w-8 h-8 flex items-center justify-center text-center group-data-[selected=true]:rounded-full group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground">
                      {date.day}
                    </div>

                    {#if datesToMark?.has(date.toString())}
                      <div
                        class="w-1.5 h-1.5 absolute rounded-full bg-primary bottom-1 left-1/2 -translate-x-1/2 group-data-[selected=true]:bottom-4 transition-all" />
                    {/if}
                  </Calendar.Day>
                </Calendar.Cell>
              {/each}
            </Calendar.GridRow>
          {/each}
        </Calendar.GridBody>
      </Calendar.Grid>
    {/each}
  </div>
</Calendar.Root>
