import { get } from "svelte/store";
import { toast } from "svelte-sonner";
import { selectedDate } from "$lib/stores";
import type { QueryClient } from "@tanstack/svelte-query";

import type { RouterInput } from "$lib/routers";
import { trpc, trpcHttp } from "$lib/utilities/trpc-client";
import { TRPCClientError } from "trpc-svelte-query";

export const setupOfflineMutations = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(["addEvent"], {
    async mutationFn(data: RouterInput["addEvent"]) {
      toast.loading("Adding event...", { id: "addEvent" });
      return await trpcHttp.addEvent.mutate(data);
    },
    async onMutate({ attendees, ...vars }: RouterInput["addEvent"]) {
      const date = get(selectedDate)?.toString();

      await trpc.getEvents.utils.cancel({ date });
      const previousEvents = trpc.getEvents.utils.getData({ date });

      trpc.getEvents.utils.setData({ date }, (data = []) => {
        const newEventData = {
          ...vars,
          createdAt: "",
          attendees: attendees.length,
          id: (previousEvents?.length || 0) + 1
        };

        return [newEventData, ...data];
      });

      return { previousEvents };
    },
    onSuccess() {
      const date = get(selectedDate)?.toString();
      toast.success("Event added successfully!", { id: "addEvent" });
      trpc.getEvents.utils.invalidate({ date });
    },
    onError(err: any, _vars, ctx) {
      const date = get(selectedDate)?.toString();
      if (err instanceof TRPCClientError && err.shape.data.zodError) {
        toast.error("Invalid data!", { id: "addEvent" });
        ctx.fieldErrors = err.shape.data.zodError.fieldErrors;
      } else {
        trpc.getEvents.utils.setData({ date }, () => ctx.previousEvents);
        toast.error("Something went wrong while trying to add event!", {
          id: "addEvent"
        });
      }
    }
  });

  queryClient.setMutationDefaults(["updateEvent"], {
    async mutationFn(data: RouterInput["updateEvent"]) {}
  });

  queryClient.setMutationDefaults(["deleteEvent"], {
    async mutationFn({ eventId }: RouterInput["deleteEvent"]) {
      toast.loading("Deleting event...", { id: "deleteEvent" });
      return await trpcHttp.deleteEvent.mutate({ eventId });
    },
    async onMutate(vars) {
      const date = get(selectedDate)?.toString();

      await trpc.getEvents.utils.cancel({ date });
      const previousEvents = trpc.getEvents.utils.getData({ date });

      trpc.getEvents.utils.setData({ date }, (data) => {
        return data?.filter((d) => d.id !== vars.eventId);
      });

      return { previousEvents };
    },
    onSuccess() {
      const date = get(selectedDate)?.toString();
      toast.success("Event deleted successfully!", { id: "deleteEvent" });
      trpc.getEvents.utils.invalidate({ date });
    },
    onError(err: any, _vars, ctx) {
      const date = get(selectedDate)?.toString();
      trpc.getEvents.utils.setData({ date }, () => ctx.previousEvents);
      toast.error("Something went wrong while trying to delete event!", {
        id: "deleteEvent"
      });
    }
  });

  queryClient.setMutationDefaults(["setAttendeeStatus"], {
    async mutationFn(data: RouterInput["setAttendeeStatus"]) {
      toast.loading("Updating status...", { id: "setAttendeeStatus" });
      return await trpcHttp.setAttendeeStatus.mutate(data);
    },
    async onMutate({ eventId, attendeeId, status }: RouterInput["setAttendeeStatus"]) {
      await trpc.getAttendees.utils.cancel({ eventId });
      const previousAttendees = trpc.getAttendees.utils.getData({ eventId });

      trpc.getAttendees.utils.setData({ eventId }, (data = []) => {
        return data.map((d) => {
          if (d.id === attendeeId) return { ...d, status };
          return d;
        });
      });

      return { previousAttendees };
    },
    onSuccess(_d, { eventId, email, status }: RouterInput["setAttendeeStatus"]) {
      toast.success(
        `Status updated to \`${status}\` for attendee \`${email}\` successfully!`,
        {
          id: "setAttendeeStatus"
        }
      );
      trpc.getAttendees.utils.invalidate({ eventId });
    },
    onError(_err, { eventId, email }: RouterInput["setAttendeeStatus"], ctx) {
      trpc.getAttendees.utils.setData({ eventId }, () => ctx.previousAttendees);
      toast.error(`Something went wrong while trying to update status for \`${email}\``, {
        id: "setAttendeeStatus"
      });
    }
  });
};
