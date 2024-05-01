import { z } from "zod";
import { and, count, eq } from "drizzle-orm";
import { env } from "$env/dynamic/private";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { db } from "$lib/database";
import { t } from "$lib/utilities/t.server";
import * as schema from "$lib/database/schema";

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
      // if not set or don't want it
      // then always pass true

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

      const audienceCounts = new Map();
      for (const event of events) {
        const audienceCount = await db
          .select({ count: count(schema.audiences.id) })
          .from(schema.audiences)
          .where(eq(schema.audiences.eventId, event.id));

        audienceCounts.set(event.id, audienceCount[0].count);
      }

      return events.map((ev) => ({ ...ev, audiences: audienceCounts.get(ev.id) }));
    }),
  getAudiences: t.procedure
    .input(z.object({ eventId: z.number() }))
    .query(async function ({ input }) {
      return await db.query.audiences.findMany({
        where: ({ eventId }, { eq }) => eq(eventId, input.eventId)
      });
    }),

  getEventById: t.procedure
    .input(z.object({ eventId: z.number() }))
    .query(async function ({ input }) {
      const event = await db.query.events.findFirst({
        where: eq(schema.events.id, input.eventId)
      });

      const audiences = await db.query.audiences.findMany({
        where: eq(schema.audiences.eventId, input.eventId)
      });

      return { ...event, audiences };
    }),

  deleteEvent: t.procedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async function ({ input }) {
      const result = await db.transaction(async function (tx) {
        await tx
          .delete(schema.audiences)
          .where(eq(schema.audiences.eventId, input.eventId));
        await tx.delete(schema.events).where(eq(schema.events.id, input.eventId));

        return true;
      });

      return Boolean(result);
    }),

  setAttendeeStatus: t.procedure
    .input(
      z.object({
        eventId: z.number(),
        audienceId: z.number(),
        status: z.enum(["present", "absent"])
      })
    )
    .mutation(async function ({ input }) {
      const result = await db
        .update(schema.audiences)
        .set({ status: input.status })
        .where(
          and(
            eq(schema.audiences.id, input.audienceId),
            eq(schema.audiences.eventId, input.eventId)
          )
        );

      return result.rowsAffected === 1;
    })
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
