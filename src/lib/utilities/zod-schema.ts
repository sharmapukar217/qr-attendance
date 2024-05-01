import { z } from "zod";

export const addEventSchema = z.object({
  title: z.string().trim().min(1, "Please provide a title for the event."),
  scheduledDate: z
    .string({ required_error: "Please provide the scheduled date." })
    .trim()
    .min(1, "Please provide the scheduled date."),
  scheduledTime: z.string().trim().min(1, "Please provide the scheduled time."),
  scheduledLocation: z
    .string({ required_error: "Please provide the event location." })
    .trim()
    .min(1, "Please provide the event location."),
  audiences: z
    .string({ required_error: "Please enter atleast one audience." })
    .trim()
    .min(1, "Please enter atleast one audience.")
});

export const updateEventSchema = z.object({
  id: z.number(),
  title: z.string().trim().min(1, "Please provide a title for the event."),
  scheduledDate: z
    .string()
    .trim()
    .min(1, "Please provide the scheduled date.")
    .optional(),
  scheduledTime: z.string().trim().min(1, "Please provide the scheduled time."),
  scheduledLocation: z
    .string({ required_error: "Please provide the event location." })
    .trim()
    .min(1, "Please provide the event location."),
  audiences: z
    .string({ required_error: "Please enter atleast one audience." })
    .trim()
    .min(1, "Please enter atleast one audience.")
});
