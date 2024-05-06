import { ZodError, z } from "zod";
import { and, count, eq, inArray } from "drizzle-orm";
import { env } from "$env/dynamic/private";
import { TRPCError, type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { db } from "$lib/database";
import { t } from "$lib/utilities/t.server";
import * as schema from "$lib/database/schema";
import { addEventSchema } from "$lib/utilities/zod-schema";
import { bulkSendInvitations } from "$lib/utilities/mailer.server";

export const appRouter = t.router({
  hasPin: t.procedure.query(function () {
    return !!env.ACCESS_PIN;
  }),
  validatePin: t.procedure
    .input(
      z.object({
        pin: z.string().trim().length(5)
      })
    )
    .mutation(function ({ input }) {
      if (!env.ACCESS_PIN) return true;
      return env.ACCESS_PIN === input.pin;
    }),

  getEvents: t.procedure
    .input(z.object({ date: z.string().optional() }).default({}))
    .query(async function ({ input }) {
      const date = input.date;

      const events = await db.query.events.findMany({
        where: ({ scheduledDate }, { eq }) => {
          return date ? eq(scheduledDate, date) : undefined;
        },
        orderBy: (e, { desc }) => [desc(e.scheduledDate)]
      });

      const counts = new Map<number, number>();

      for (const event of events) {
        const attendeesCount = await db
          .select({ count: count(schema.attendees.id) })
          .from(schema.attendees)
          .where(eq(schema.attendees.eventId, event.id));

        counts.set(event.id, attendeesCount[0].count);
      }

      return events.map((ev) => ({ ...ev, attendees: counts.get(ev.id) }));
    }),
  getAttendees: t.procedure
    .input(z.object({ eventId: z.number() }))
    .query(async function ({ input }) {
      return await db.query.attendees.findMany({
        where: ({ eventId }, { eq }) => eq(eventId, input.eventId)
      });
    }),

  getEventById: t.procedure
    .input(z.object({ eventId: z.number() }))
    .query(async function ({ input }) {
      const event = await db.query.events.findFirst({
        where: eq(schema.events.id, input.eventId)
      });

      if (!event) throw new TRPCError({ message: "Event not found", code: "NOT_FOUND" });

      const attendees = await db.query.attendees.findMany({
        where: eq(schema.attendees.eventId, input.eventId)
      });

      return { ...event, attendees };
    }),

  deleteEvent: t.procedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async function ({ input }) {
      const result = await db.transaction(async function (tx) {
        await tx
          .delete(schema.attendees)
          .where(eq(schema.attendees.eventId, input.eventId));
        await tx.delete(schema.events).where(eq(schema.events.id, input.eventId));

        return true;
      });

      return Boolean(result);
    }),

  setAttendeeStatus: t.procedure
    .input(
      z.object({
        eventId: z.number(),
        attendeeId: z.number(),
        email: z.string().trim().email(),
        status: z.enum(["present", "absent"])
      })
    )
    .mutation(async function ({ input }) {
      const result = await db
        .update(schema.attendees)
        .set({ status: input.status })
        .where(
          and(
            eq(schema.attendees.id, input.attendeeId),
            eq(schema.attendees.eventId, input.eventId)
          )
        );

      return result.rowsAffected === 1;
    }),

  addEvent: t.procedure.input(addEventSchema).mutation(async function ({ input }) {
    const { attendees, shouldSendEmail, ...eventInfo } = input;
    const dbResult = await db.transaction(async function (tx) {
      const events = await tx
        .insert(schema.events)
        .values(eventInfo)
        .returning({ id: schema.events.id });

      const eventId = events[0].id;

      const attendeesList = await tx
        .insert(schema.attendees)
        .values(
          attendees.map((attendee) => ({
            ...attendee,
            eventId,
            emailSent: shouldSendEmail ? 0 : 1
          }))
        )
        .returning();

      return { eventId, attendeesList };
    });

    if (shouldSendEmail) {
      const successfulEmailsResults = await bulkSendInvitations(
        dbResult.attendeesList.map((r) => ({
          email: r.email,
          attendeeId: r.id,
          eventId: r.eventId,
          eventTitle: eventInfo.title,
          eventDate: eventInfo.scheduledDate,
          eventTime: eventInfo.scheduledTime,
          eventLocation: eventInfo.scheduledLocation
        }))
      );

      if (successfulEmailsResults.length) {
        await db
          .update(schema.attendees)
          .set({ emailSent: 1 })
          .where(
            and(
              eq(schema.attendees.eventId, dbResult.eventId),
              inArray(
                schema.attendees.email,
                successfulEmailsResults.map((f) => f.email)
              )
            )
          );
      }
    }

    return true;
  }),

  removeAttendeeFromEvent: t.procedure
    .input(
      z.object({
        eventId: z.number(),
        attendeeId: z.number()
      })
    )
    .mutation(async function ({ input }) {
      return await db
        .delete(schema.attendees)
        .where(
          and(
            eq(schema.attendees.eventId, input.eventId),
            eq(schema.attendees.id, input.attendeeId)
          )
        );
    }),
  updateEvent: t.procedure.input(addEventSchema).mutation(async function ({ input }) {
    const { attendees, ...eventInfo } = input;

    if (!eventInfo || !eventInfo.id) return;

    const eventId = eventInfo.id!;
    const oldattendeesData = await db.query.attendees.findMany({
      where: (aud, { eq }) => eq(aud.eventId, eventId)
    });

    const oldAttendees = oldattendeesData.map((a) => a.email);
    const newAttendees = attendees.filter(
      (attendee) => !oldAttendees.includes(attendee.email)
    );

    const dbResult = await db.transaction(async function (tx) {
      await tx
        .update(schema.events)
        .set({ ...eventInfo })
        .where(eq(schema.events.id, eventId));

      if (newAttendees.length) {
        return await tx
          .insert(schema.attendees)
          .values(newAttendees.map((attendee) => ({ ...attendee, eventId })))
          .returning();
      }
    });

    if (dbResult?.length) {
      const successfulEmailsResults = await bulkSendInvitations(
        await dbResult.map((r) => ({
          email: r.email,
          attendeeId: r.id,
          eventId: r.eventId,
          eventTitle: eventInfo.title,
          eventDate: eventInfo.scheduledDate,
          eventTime: eventInfo.scheduledTime,
          eventLocation: eventInfo.scheduledLocation
        }))
      );

      if (successfulEmailsResults.length) {
        await db
          .update(schema.attendees)
          .set({ emailSent: 1 })
          .where(
            and(
              eq(schema.attendees.eventId, eventId),
              inArray(
                schema.attendees.email,
                successfulEmailsResults.map((f) => f.email)
              )
            )
          );
      }
    }

    return true;
  }),

  resendInvitation: t.procedure
    .input(
      z.object({
        eventId: z.number(),
        attendeeId: z.number(),
        email: z.string().trim().email()
      })
    )
    .mutation(async function ({ input }) {
      const event = await db.query.events.findFirst({
        where: (event, { eq }) => eq(event.id, input.eventId)
      });

      if (!event) throw new TRPCError({ message: "Event not found", code: "NOT_FOUND" });

      const successfulEmails = await bulkSendInvitations([
        {
          attendeeId: input.attendeeId,
          email: input.email,
          eventId: input.eventId,
          eventDate: event.scheduledDate,
          eventLocation: event.scheduledLocation,
          eventTime: event.scheduledTime,
          eventTitle: event.title
        }
      ]);

      if (successfulEmails.length) {
        await db
          .update(schema.attendees)
          .set({ emailSent: 1 })
          .where(
            and(
              eq(schema.attendees.id, input.attendeeId),
              eq(schema.attendees.eventId, input.eventId)
            )
          );
        return true;
      }

      return false;
    })
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
