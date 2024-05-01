import { sql, relations } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull().default("ALL DAY"),
  scheduledLocation: text("scheduled_location").notNull().default("REMOTE"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const audiences = sqliteTable("audiences", {
  id: integer("id").primaryKey(),
  // name: text("name"),
  email: text("email").notNull(),
  eventId: integer("event_id").notNull(),
  status: text("status").notNull().default("unknown")
});

export const audiencesRelation = relations(audiences, ({ many }) => ({
  audiences: many(audiences)
}));
