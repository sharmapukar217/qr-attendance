<script lang="ts">
  import { Select } from "bits-ui";
  import { readable } from "svelte/store";
  import { today, getLocalTimeZone } from "@internationalized/date";
  import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
  import {
    addPagination,
    addSortBy,
    addTableFilter
  } from "svelte-headless-table/plugins";

  import type { RouterOutput } from "$lib/routers";
  import { trpc } from "$lib/utilities/trpc-client";
  import QrScanner from "$lib/components/QRScanner.svelte";
  import StatusCell from "$lib/components/StatusCell.svelte";
  import ActionCell from "$lib/components/ActionCell.svelte";
  import DatePicker from "$lib/components/DatePicker.svelte";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import PinChecker from "$lib/components/PinChecker.svelte";

  let eventId: string | undefined;

  const todayDate = today(getLocalTimeZone());
  let value = todayDate;

  const allEvents = trpc.getEvents.query({ date: undefined });

  $: dates = new Set($allEvents.data?.map((d) => d.scheduledDate) ?? []);
  $: hasEvents = dates.has(value?.toString());

  $: events = trpc.getEvents.query(
    { date: value?.toString() },
    { enabled: !!value && hasEvents }
  );

  $: attendees = trpc.getAttendees.query(
    { eventId: Number(eventId) },
    { enabled: !!eventId }
  );

  $: data = readable($attendees.data ?? []);
  $: table = createTable<RouterOutput["getAttendees"][number]>(data, {
    page: addPagination(),
    sort: addSortBy({ disableMultiSort: true }),
    filter: addTableFilter({
      fn: ({ filterValue, value }) => value.includes(filterValue)
    })
  });

  $: columns = table.createColumns([
    table.column({
      header: "#.",
      accessor: "id",
      plugins: {
        sort: { disable: true },
        filter: { exclude: true }
      }
    }),
    table.column({
      header: "Name",
      accessor: "name",
      plugins: { sort: { disable: false }, filter: { exclude: false } }
    }),
    table.column({
      accessor: "email",
      header: "Email",
      plugins: { sort: { disable: false }, filter: { exclude: false } }
    }),
    table.column({
      header: "Phone Number",
      accessor: "phoneNumber",
      plugins: { sort: { disable: false }, filter: { exclude: false } }
    }),
    table.column({
      accessor: "status",
      header: "Status",
      cell: (item) => {
        return createRender(StatusCell, { status: item.value });
      },
      plugins: { sort: { disable: false }, filter: { exclude: false } }
    }),
    table.column({
      header: "Actions",
      accessor: ({ id }) => id,
      cell: (item) => {
        return createRender(ActionCell, {
          // @ts-expect-error item.row.original is not defined in typescript, but present in js object
          attendee: item.row.original,
          allowAttendance: value.toString() === todayDate.toString()
        });
      },
      plugins: {
        plugins: { sort: { disable: false }, filter: { exclude: false } }
      }
    })
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));

  $: ({ filterValue } = pluginStates.filter);
</script>

<MainLayout title="Attendance" activeTab="attendance">
  <PinChecker />

  <div class="flex h-full flex-col md:flex-row md:items-center justify-end gap-3 p-1">
    <DatePicker
      id="date"
      bind:value
      datesToMark={dates}
      classes={{
        trigger: "justify-start bg-muted hover:bg-muted/85 ring-0 ring-offset-0"
      }}
      onValueChange={() => {
        eventId = undefined;
      }} />

    <Select.Root
      onSelectedChange={function (v) {
        // @ts-ignore
        eventId = v?.value;
      }}>
      <Select.Trigger
        disabled={!hasEvents}
        class="
        inline-flex text-sm font-medium md:font-semibold bg-muted hover:bg-muted/85 text-foreground border rounded-lg px-3 py-2
        disabled:cursor-not-allowed disabled:opacity-80 disabled:bg-muted">
        {#if eventId}
          <Select.Value class="text-foreground" />
        {:else if hasEvents}
          <div class="text-muted-foreground">Select the event</div>
        {:else}
          <div class="text-muted-foreground">No Events!</div>
        {/if}
      </Select.Trigger>

      <Select.Content
        align="end"
        sideOffset={5}
        sameWidth={false}
        class="absolute left-0 z-50 min-w-[12rem] overflow-hidden rounded-md border bg-background text-foreground shadow-sm focus:outline-none">
        <div class="w-full p-1">
          {#if $events.data}
            {#each $events.data as event}
              <Select.Item
                value={event.id}
                class="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm font-semibold outline-none
              data-[disabled]:pointer-events-none data-[highlighted]:bg-muted data-[highlighted]:text-muted-foreground data-[disabled]:opacity-50">
                <Select.ItemIndicator
                  class="absolute left-2 top-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center">
                  <div class="icon-[bi--check2] w-4 h-4" />
                </Select.ItemIndicator>
                <div>{event.title}</div>
              </Select.Item>
            {/each}
          {/if}
        </div>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="md:w-full px-1 my-3 max-md:space-x-3 flex items-center">
    <input
      disabled={!eventId}
      bind:value={$filterValue}
      placeholder="Search for the attendee"
      class="w-full md:w-auto border rounded-md text-sm font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
      focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
      disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted disabled:placeholder-muted" />

    {#if hasEvents && value && todayDate.compare(value) == 0 && eventId}
      <QrScanner eventId={Number(eventId)} />
    {/if}
  </div>

  <div class="relative w-full overflow-auto mt-3 p-1 border rounded-lg shadow">
    {#if hasEvents && eventId}
      <table class="w-full caption-bottom text-sm" {...$tableAttrs}>
        <thead class="border-b rounded-t-lg">
          {#each $headerRows as headerRow}
            <Subscribe rowAttrs={headerRow.attrs()}>
              <tr
                class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              </tr>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                  <th
                    {...attrs}
                    class="h-10 px-2 text-left align-middle font-medium md:font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                    <Render of={cell.render()} />
                  </th>
                </Subscribe>
              {/each}
            </Subscribe>
          {/each}
        </thead>

        <tbody class="[&_tr:last-child]:border-0 rounded-b-lg" {...$tableBodyAttrs}>
          {#each $pageRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <tr
                class="transition-colors border-b hover:bg-muted/50 data-[state=selected]:bg-muted">
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <td
                      class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] [&:has([role=checkbox])]:pl-3"
                      {...attrs}>
                      <Render of={cell.render()} />
                    </td>
                  </Subscribe>
                {/each}
              </tr>
            </Subscribe>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="p-2 text-center font-medium md:font-semibold text-muted-foreground">
        <h1>
          {#if !value}
            Please select the date and the event
          {:else if value && !hasEvents}
            No events for selected date!
          {:else if value && !eventId}
            Please select an event.
          {/if}
        </h1>
      </div>
      <!-- {:else if !value}
      <div class="p-2 text-center font-medium md:font-semibold text-muted-foreground">
        <h1>Please select the date and the event</h1>
      </div>
    {:else if !hasEvents}
      <div class="p-2 text-center font-medium md:font-semibold text-muted-foreground">
        <h1>No events for selected date!</h1>
      </div>
    {:else}
      <div class="p-2 text-center font-medium md:font-semibold text-muted-foreground">
        <h1>Please select an event.</h1>
      </div> -->
    {/if}
  </div>
</MainLayout>
