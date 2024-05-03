import { zod } from "sveltekit-superforms/adapters";
import { fail, superValidate } from "sveltekit-superforms";

import { db } from "$lib/database";
import * as schema from "$lib/database/schema";
import { addEventSchema, updateEventSchema } from "$lib/utilities/zod-schema";
import { eq, inArray } from "drizzle-orm";
import { bulkSendInvitations, filterEmails } from "$lib/utilities/mailer.server.js";

export const load = async (event) => {
  return {
    addEventForm: await superValidate(zod(addEventSchema))
  };
};

export const actions = {
  async addEvent(event) {
    const addEventForm = await superValidate(event.request, zod(addEventSchema));
    if (!addEventForm.valid) return fail(400, { addEventForm });

    const { attendees, ...eventData } = addEventForm.data;

    try {
      const result = await db.transaction(async function (tx) {
        const newEvent = await tx
          .insert(schema.events)
          .values([eventData])
          .returning({ id: schema.events.id });

        const listOfEmails = attendees
          .split(",")
          .map((e) => e.trim())
          .filter((v) => !!v);

        const attendeeEmails = filterEmails(listOfEmails).map((e) => ({
          email: e.trim(),
          eventId: newEvent[0].id
        }));

        return await tx.insert(schema.attendees).values(attendeeEmails).returning();
      });

      try {
        await bulkSendInvitations(
          result.map((r) => ({
            email: r.email,
            attendeeId: r.id,
            eventId: r.eventId,
            eventTitle: eventData.title,
            eventDate: eventData.scheduledDate,
            eventTime: eventData.scheduledTime,
            eventLocation: eventData.scheduledLocation
          }))
        );
      } catch {
        // just to make sure app doesn't crash email error
      }

      addEventForm.message = "Event added successfully!";
    } catch {
      addEventForm.message = "Oops! Something went wrong!";
      return fail(500, { addEventForm });
    }

    return { addEventForm };
  },

  async updateEvent(event) {
    const updateEventForm = await superValidate(event.request, zod(updateEventSchema));
    if (!updateEventForm.valid) return fail(400, { updateEventForm });

    const { attendees: attendeesInput, ...eventData } = updateEventForm.data;

    try {
      const oldEventData = await db.query.events.findFirst({
        where: (ev, { eq }) => eq(ev.id, eventData.id)
      });

      if (!oldEventData) {
        return fail(500, { updateEventForm });
      }

      const oldattendeesData = await db.query.attendees.findMany({
        where: (aud, { eq }) => eq(aud.eventId, eventData.id)
      });

      const oldattendees = oldattendeesData.map((a) => a.email);

      const attendeesFromInput = filterEmails(
        attendeesInput
          ?.split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      );

      const newattendees = filterEmails(
        attendeesFromInput.filter((aud) => !oldattendees.includes(aud))
      );

      const attendeesToRemove = filterEmails(
        oldattendees.filter((aud) => !attendeesFromInput.includes(aud))
      );

      const result = await db.transaction(async function (tx) {
        await tx
          .update(schema.events)
          .set({ ...eventData })
          .where(eq(schema.events.id, eventData.id));

        if (attendeesToRemove.length) {
          await tx
            .delete(schema.attendees)
            .where(inArray(schema.attendees.email, attendeesToRemove));
        }

        if (newattendees.length) {
          return await tx
            .insert(schema.attendees)
            .values(
              newattendees.map((a) => ({
                email: a,
                eventId: eventData.id
              }))
            )
            .returning();
        }

        return;
      });

      if (result?.length) {
        try {
          await bulkSendInvitations(
            result.map((r) => ({
              email: r.email,
              attendeeId: r.id,
              eventId: oldEventData.id,
              eventTitle: oldEventData.title,
              eventDate: oldEventData.scheduledLocation,
              eventLocation: oldEventData.scheduledLocation,
              eventTime: oldEventData.scheduledTime
            }))
          );
        } catch {
          // just to make sure app doesn't crash email error
        }
      }

      updateEventForm.message = "Event updated successfully!";
    } catch (err) {
      console.log(err);
      updateEventForm.message = "Oops! Something went wrong!";
      return fail(500, { updateEventForm });
    }

    return { updateEventForm };
  }
};
