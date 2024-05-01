<script lang="ts">
  import { Tooltip } from "bits-ui";
  import { twMerge } from "tailwind-merge";

  export let status: string;
</script>

<Tooltip.Root>
  <Tooltip.Trigger
    data-status={status}
    class={twMerge(
      "cursor-pointer w-2.5 h-2.5 rounded-full mt-2 ms-4",
      status === "absent" && "bg-red-500",
      status === "present" && "bg-green-500",
      status === "unknown" && "bg-foreground/50"
    )} />
  <Tooltip.Content
    side="right"
    sideOffset={10}
    class="z-50 overflow-hidden rounded-md bg-foreground/80 backdrop-blur-sm px-3 py-1 text-xs text-background uppercase">
    {status}
  </Tooltip.Content>
</Tooltip.Root>
