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
  attendees: z
    .object({
      name: z.string().trim().min(1, "Please provide the name of the attendee."),
      email: z
        .string({ required_error: "Please enter the email address of the attendee." })
        .trim()
        .email("Please provide a valid email address!"),
      phoneNumber: z
        .string()
        .trim()
        .min(1, "Please provide the phone number of the attendee.")
    })
    .array()
});

export const addEventSchemaOpt = z.object({
  title: z.string().optional(),
  scheduledDate: z
    .string({ required_error: "Please provide the scheduled date." })
    .trim()
    .optional(),
  scheduledTime: z.string().trim().min(1, "Please provide the scheduled time."),
  scheduledLocation: z
    .string({ required_error: "Please provide the event location." })
    .trim()
    .min(1, "Please provide the event location."),
  attendees: z
    .object({
      name: z.string().trim().min(1, "Please provide the name of the attendee."),
      email: z
        .string({ required_error: "Please enter the email address of the attendee." })
        .trim()
        .email("Please provide a valid email address!"),
      phoneNumber: z
        .string()
        .trim()
        .min(1, "Please provide the phone number of the attendee.")
    })
    .array()
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
  attendees: z
    .string({ required_error: "Please enter atleast one attendee." })
    .trim()
    .min(1, "Please enter atleast one attendee.")
});
