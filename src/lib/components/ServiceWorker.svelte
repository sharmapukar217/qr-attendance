<script lang="ts">
  import { onMount } from "svelte";
  import * as pkg from "workbox-window";
  import { toast } from "svelte-sonner";
  import { dev } from "$app/environment";

  onMount(() => {
    const wb = new pkg.Workbox("/service-worker.js", {
      type: dev ? "module" : "classic"
    });

    wb.addEventListener("activated", (event) => {
      if (!event.isUpdate) {
        toast.success("App is ready to work in offline mode.", { id: "sw" });
      }
    });
    wb.addEventListener("controlling", () => {
      window.location.reload();
    });
    wb.addEventListener("waiting", () => {
      toast("An update is available. Would you like to update?", {
        duration: Infinity,
        action: {
          label: "Update",
          onClick: () => wb.messageSkipWaiting()
        }
      });
    });

    wb.register();
  });
</script>
