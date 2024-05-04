<script lang="ts">
  import Cookie from "js-cookie";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { PinInput, Toggle, Dialog } from "bits-ui";

  import { isUnlocked } from "$lib/stores";
  import { trpc } from "$lib/utilities/trpc-client";

  let open = true;
  let error = false;
  let unlocked = false;
  let remaningRetries = 5;
  let value: string[] | undefined = [];

  let pinInputType: "text" | "password" = "password";

  $: pinInputType = unlocked ? "text" : "password";

  const hasPinQuery = trpc.hasPin.query();
  const pinMuation = trpc.validatePin.mutation();

  $: if ($hasPinQuery.data === false) {
    open = false;
  }

  $: isLocked = remaningRetries === 0;

  onMount(() => {
    if (Cookie.get("isLocked") === "true") isLocked = true;
    if (Cookie.get("isUnlocked") === "true") isUnlocked.set(true);
  });
</script>

{#if !$isUnlocked}
  <Dialog.Root bind:open closeOnEscape={false} closeOnOutsideClick={false}>
    <Dialog.Overlay class="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" />
    <Dialog.Content
      class="fixed left-[50%] top-[50%] z-[101] grid w-[92%] max-w-lg h-1/2 max-h-[96%] overflow-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg lg:w-full {isLocked
        ? 'border-destructive'
        : ''}">
      <!-- pin here -->

      {#if !isLocked}
        <div class="flex flex-col text-left h-full">
          <h1 class="text-xl font-semibold leading-none tracking-tight">
            Enter the pin to continue...
          </h1>

          <PinInput.Root
            bind:value
            type={pinInputType}
            onValueChange={async (v) => {
              if (!v) return;

              const pin = v.join("").trim();
              if (pin.length === 5) {
                try {
                  error = false;
                  const matched = await $pinMuation.mutateAsync({ pin });
                  toast.loading("Please wait while validating...", { id: "pin" });
                  if (matched) {
                    open = false;
                    error = false;
                    isUnlocked.set(true);
                    Cookie.remove("isLocked");
                    Cookie.set("isUnlocked", "true");
                    toast.success("Pin matched. Welcome admin!", { id: "pin" });
                  } else {
                    error = true;
                    if (remaningRetries > 0) {
                      remaningRetries--;
                    } else {
                      Cookie.set("isLocked", "true");
                    }
                    toast.error(`Pin mismatched! Remaning tries: ${remaningRetries}`, {
                      id: "pin"
                    });
                  }
                } catch {
                  toast.error("Something went wrong while trying to validate the pin", {
                    id: "pin"
                  });
                } finally {
                  value = [];
                }
              }
            }}
            class="flex-1 flex items-center gap-3 lg:gap-4 m-auto">
            <PinInput.Input
              class="flex justify-center items-center text-center border size-9 lg:size-12 rounded-md text-sm lg:text-lg font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                    focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                    aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive" />
            <PinInput.Input
              class="flex justify-center items-center text-center border size-9 lg:size-12 rounded-md text-sm lg:text-lg font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                    focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                    aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive" />
            <PinInput.Input
              class="flex justify-center items-center text-center border size-9 lg:size-12 rounded-md text-sm lg:text-lg font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                    focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                    aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive" />
            <PinInput.Input
              class="flex justify-center items-center text-center border size-9 lg:size-12 rounded-md text-sm lg:text-lg font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                    focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                    aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive" />

            <PinInput.Input
              class="flex justify-center items-center text-center border size-9 lg:size-12 rounded-md text-sm lg:text-lg font-medium lg:font-semibold px-3 py-2 text-muted-foreground bg-muted/40
                              focus:outline-none focus:text-foreground focus:ring-2 focus:ring-primary
                              aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:text-destructive aria-invalid:placeholder-destructive" />

            <PinInput.HiddenInput />

            <Toggle.Root
              class="inline-flex size-9 lg:size-12 items-center text-sm  justify-center rounded-[9px] text-foreground/40 transition-all hover:bg-muted/85 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
              bind:pressed={unlocked}>
              <div
                class="w-6 h-6"
                class:icon-[heroicons--eye]={!unlocked}
                class:icon-[heroicons--eye-slash]={unlocked} />
            </Toggle.Root>
          </PinInput.Root>
          <small class="text-sm font-semibold">Remaning retries: {remaningRetries}</small>
        </div>
      {:else}
        <div
          class="text-3xl font-semibold text-muted-foreground text-center flex items-center justify-center">
          Access locked!!!
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{/if}
