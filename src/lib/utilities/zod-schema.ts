import { z } from "zod";

export const addEventSchema = z.object({
  id: z.number().optional(),
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
      id: z.number().optional(),
      name: z.string().trim().min(1, "Please provide the name of the attendee."),
      email: z
        .string({ required_error: "Please enter the email address of the attendee." })
        .trim()
        .email("Please provide a valid email address!"),
      phoneNumber: z.string().trim().optional()
    })
    .array()
    .superRefine((values, ctx) => {
      const seen = new Set<string>();
      for (const [i, value] of values.entries()) {
        if (!!value.email && seen.has(value.email)) {
          console.log(i);
          ctx.addIssue({
            path: [i, "email"],
            code: z.ZodIssueCode.custom,
            message: "This email is already in the list"
          });
        } else {
          seen.add(value.email);
        }
      }
    })
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
