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

    const { audiences, ...eventData } = addEventForm.data;

    try {
      const result = await db.transaction(async function (tx) {
        const newEvent = await tx
          .insert(schema.events)
          .values([eventData])
          .returning({ id: schema.events.id });

        const listOfEmails = audiences
          .split(",")
          .map((e) => e.trim())
          .filter((v) => !!v);

        const audienceEmails = filterEmails(listOfEmails).map((e) => ({
          email: e.trim(),
          eventId: newEvent[0].id
        }));

        return await tx.insert(schema.audiences).values(audienceEmails).returning();
      });

      try {
        await bulkSendInvitations(
          result.map((r) => ({
            email: r.email,
            audienceId: r.id,
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

    const { audiences: audiencesInput, ...eventData } = updateEventForm.data;

    try {
      const oldEventData = await db.query.events.findFirst({
        where: (ev, { eq }) => eq(ev.id, eventData.id)
      });

      if (!oldEventData) {
        return fail(500, { updateEventForm });
      }

      const oldAudiencesData = await db.query.audiences.findMany({
        where: (aud, { eq }) => eq(aud.eventId, eventData.id)
      });

      const oldAudiences = oldAudiencesData.map((a) => a.email);

      const audiencesFromInput = filterEmails(
        audiencesInput
          ?.split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      );

      const newAudiences = filterEmails(
        audiencesFromInput.filter((aud) => !oldAudiences.includes(aud))
      );

      const audiencesToRemove = filterEmails(
        oldAudiences.filter((aud) => !audiencesFromInput.includes(aud))
      );

      const result = await db.transaction(async function (tx) {
        await tx
          .update(schema.events)
          .set({ ...eventData })
          .where(eq(schema.events.id, eventData.id));

        if (audiencesToRemove.length) {
          await tx
            .delete(schema.audiences)
            .where(inArray(schema.audiences.email, audiencesToRemove));
        }

        if (newAudiences.length) {
          return await tx
            .insert(schema.audiences)
            .values(
              newAudiences.map((a) => ({
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
              audienceId: r.id,
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
