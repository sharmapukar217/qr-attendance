import { get } from "svelte/store";
import { toast } from "svelte-sonner";
import { selectedDate } from "$lib/stores";
import type { QueryClient } from "@tanstack/svelte-query";

import type { RouterInput } from "$lib/routers";
import { trpc, trpcHttp } from "$lib/utilities/trpc-client";
import { TRPCClientError } from "trpc-svelte-query";

export const setupOfflineMutations = (queryClient: QueryClient) => {
  /**
   * mutation to add the event
   */
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

  /**
   * mutation to delte the event
   */
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

  /**
   * mutation to set attendee status ( present | absent )
   */
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

  queryClient.setMutationDefaults(["removeAttendeeFromEvent"], {
    async mutationFn(data: RouterInput["removeAttendeeFromEvent"]) {
      toast.loading("Removing attendee from event...", { id: "removeAttendeeFromEvent" });
      return await trpcHttp.removeAttendeeFromEvent.mutate(data);
    },
    async onMutate({ eventId, attendeeId }: RouterInput["removeAttendeeFromEvent"]) {
      const date = get(selectedDate)?.toString();

      await trpc.getEvents.utils.cancel({ date });
      await trpc.getEventById.utils.cancel({ eventId });

      const previousEvents = trpc.getEvents.utils.getData({ date });
      const previousEvent = trpc.getEventById.utils.getData({ eventId });

      trpc.getEventById.utils.setData({ eventId }, (data) => {
        if (!data) return;

        return {
          ...data,
          attendees: data?.attendees?.filter((attendee) => attendee.id !== attendeeId)
        };
      });

      trpc.getEvents.utils.setData({ date }, (events) => {
        return events?.map((event) => {
          if (event.id === eventId) {
            return { ...event, attendees: event.attendees ? event.attendees - 1 : 0 };
          }
          return event;
        });
      });

      return { previousEvent, previousEvents };
    },
    onSuccess(_d, { eventId, attendeeId }: RouterInput["removeAttendeeFromEvent"], ctx) {
      const date = get(selectedDate)?.toString();
      const attendee = ctx?.previousEvent?.attendees?.find(
        (a: any) => a.id === attendeeId
      );
      toast.success(`Attendee \`${attendee.name}\` removed successfully !`, {
        id: "removeAttendeeFromEvent"
      });

      trpc.getEvents.utils.invalidate({ date });
      trpc.getEventById.utils.invalidate({ eventId });
    },
    onError(_err, { eventId, attendeeId }: RouterInput["removeAttendeeFromEvent"], ctx) {
      const date = get(selectedDate)?.toString();
      const attendee = ctx?.previousEvent?.attendees?.find(
        (a: any) => a.id === attendeeId
      );

      trpc.getEvents.utils.setData({ date }, () => ctx.previousEvents);
      trpc.getEventById.utils.setData({ eventId }, () => ctx.previousEvent);
      toast.error(
        `Something went wrong while trying to remove \`${attendee.name}\` from the list.`,
        {
          id: "removeAttendeeFromEvent"
        }
      );
    }
  });

  /**
   * mutation to update the the event
   */
  queryClient.setMutationDefaults(["updateEvent"], {
    async mutationFn(data: RouterInput["updateEvent"]) {
      toast.loading("Updating event details...", { id: "updateEvent" });
      return await trpcHttp.updateEvent.mutate(data);
    },
    async onMutate({ id, ...eventInfo }: RouterInput["updateEvent"]) {
      if (!id) return;

      const date = get(selectedDate)?.toString();

      await trpc.getEvents.utils.cancel({ date });
      await trpc.getEventById.utils.cancel({ eventId: id });

      const previousEvents = trpc.getEvents.utils.getData({ date });
      const previousEvent = trpc.getEventById.utils.getData({ eventId: id });

      // @ts-expect-error assuring that attendees[number].id always exist
      trpc.getEventById.utils.setData({ eventId: id }, (data) => {
        if (!data) return;
        return { ...data, ...eventInfo };
      });

      trpc.getEvents.utils.setData({ date }, (events) => {
        return events?.map((event) => {
          if (event.id === id) {
            return { ...event, attendees: eventInfo.attendees.length || 0 };
          }
          return event;
        });
      });

      return { previousEvent, previousEvents };
    },
    onSuccess(_d, { id }: RouterInput["updateEvent"]) {
      if (!id) return;

      const date = get(selectedDate)?.toString();

      trpc.getEvents.utils.invalidate({ date });
      trpc.getEventById.utils.invalidate({ eventId: id });
      toast.success(`Event updated successfully !`, { id: "updateEvent" });
    },
    onError(_err, { id }: RouterInput["updateEvent"], ctx) {
      if (!id) return;
      const date = get(selectedDate)?.toString();
      trpc.getEvents.utils.setData({ date }, () => ctx.previousEvents);
      trpc.getEventById.utils.setData({ eventId: id }, () => ctx.previousEvent);
      toast.error(`Something went wrong while trying to update event info.`, {
        id: "updateEvent"
      });
    }
  });

  /**
   * mutation to update the the event
   */
  queryClient.setMutationDefaults(["resendInvitation"], {
    async mutationFn(data: RouterInput["resendInvitation"]) {
      toast.loading("Trying to resend invitaion...", { id: "resendInvitation" });

      try {
        const isOK = await trpcHttp.resendInvitation.mutate(data);
        if (isOK) {
          await trpc.getEventById.utils.cancel({ eventId: data.eventId });

          // @ts-ignore
          trpc.getEventById.utils.setData({ eventId: data.eventId }, (oldData) => {
            return {
              ...oldData,
              attendees: oldData?.attendees?.map((attendee) => {
                if (attendee.id !== data.attendeeId) return attendee;
                return { ...attendee, emailSent: true };
              })
            };
          });

          toast.success(`Invitation email sent sucessfully to \`${data.name}\`!`, {
            id: "resendInvitation"
          });
          trpc.getEventById.utils.invalidate({ eventId: data.eventId });
        } else {
          toast.error(
            `Something went wrong while trying to resend invitation email! to \`${data.name}\`!`,
            {
              id: "resendInvitationn"
            }
          );
        }
      } catch {
        toast.error(
          `Something went wrong while trying to resend invitation email! to \`${data.name}\`!`,
          {
            id: "resendInvitation"
          }
        );
      }
    }
  });
};
