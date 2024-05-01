<script lang="ts">
  import { Dialog } from "bits-ui";
  import QrScanner from "qr-scanner";
  import { toast } from "svelte-sonner";
  import { onDestroy, tick } from "svelte";
  import { twMerge } from "tailwind-merge";
  import { trpc } from "$lib/utilities/trpc-client";

  export let eventId: number;

  let qrScanner: QrScanner | undefined;

  let videoEl: HTMLVideoElement | undefined = undefined;

  let status = "scanning";
  let message = "Scanning...";

  const updateStatusMutation = trpc.setAttendeeStatus.mutation();
  const audiences = trpc.getAudiences.query(
    { eventId },
    { enabled: !!eventId, select: (aud) => aud.map((a) => a.email) }
  );

  const swapCamera = () => {};

  const delay = async (time = 500) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  const handleQRScan = async (result: QrScanner.ScanResult) => {
    status = "scanning";

    try {
      const data = JSON.parse(result.data);

      if (!data || data?.eventId !== eventId) {
        message = "Wrong event! Can't mark as present.";
        status = "error";
        return;
      }

      if ($audiences.data?.includes(data.email)) {
        message = `Already marked as \`present\` for ${data.email}`;
        status = "success";
        return;
      }

      await $updateStatusMutation.mutateAsync({
        eventId: 1,
        audienceId: 1,
        status: "present"
      });

      message = `Updated status for ${data.email} to \`present\``;
      status = "success";
    } catch (err) {
      message = `Can't update status for <email here>`;
      status = "error";
    } finally {
      if (status === "error") toast.error(message);
      else toast.success(message);

      await delay();
      status = "scanning";
      message = "scanning";
    }
  };

  $: if (videoEl) {
    qrScanner = new QrScanner(videoEl, handleQRScan, {
      maxScansPerSecond: 1,
      highlightScanRegion: true,
      highlightCodeOutline: true
    });

    qrScanner.start();
  }

  onDestroy(() => {
    qrScanner?.destroy();
  });
</script>

<Dialog.Root
  onOpenChange={function (open) {
    if (qrScanner && !open) qrScanner.stop();
  }}>
  <Dialog.Trigger
    title="Start Scanner"
    class="md:ml-auto bg-primary text-sm font-semibold text-primary-foreground inline-flex items-center justify-center rounded-lg py-2.5 px-3
  focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background hover:bg-primary/85">
    <div class="icon-[heroicons--qr-code] h-4 w-4" />
    <p class="hidden md:inline md:ms-3">Start Scanner</p>
  </Dialog.Trigger>

  <Dialog.Overlay class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
  <Dialog.Content
    class="fixed left-[2%] max-w-2xl md:left-1/2 top-0 z-50 w-[90%] lg:w-full h-[100%] md:-translate-x-1/2  border bg-background shadow-lg rounded-lg flex flex-col">
    <div class="flex flex-row items-center space-y-1.5 text-left px-4 py-4 border-b">
      <h1 class="text-lg font-semibold leading-none tracking-tight">QR Scanner</h1>
      <Dialog.Close
        class="ml-auto rounded-sm opacity-70 transition-all hover:opacity-100 hover:text-destructive">
        <div class="icon-[heroicons--x-mark] w-4 h-4"></div>
      </Dialog.Close>
    </div>

    <div class="h-full flex flex-col">
      <div
        class={twMerge(
          "py-1 px-3 bg-muted border-b text-sm font-medium md:font-semibold",
          status === "success" && "text-green-500",
          status === "scanning" && "text-primary",
          status === "error" && "text-red-500"
        )}>
        {message}
      </div>
      <video
        width="100%"
        height="100%"
        bind:this={videoEl}
        on:dblclick={swapCamera}
        class="h-full w-full object-fill scanner-{status}">
        <track kind="captions" />
      </video>
    </div>
    <div
      class="border-t text-sm font-medium md:font-semibold text-muted-foreground text-center py-1">
      Made with ❤️ by <a href="/" class="text-primary hover:underline"> hyperce.io </a>
    </div>
  </Dialog.Content>
</Dialog.Root>