import { z } from "zod";
import { DAY_OF_WEEK_IN_ORDER } from "../constants";
import { TimeToInt } from "../utils";

export const ScheduleFormSchema = z.object({
  timezone: z.string().min(1, "Required"),
  availabilities: z
    .array(
      z.object({
        dayOfWeek: z.enum(DAY_OF_WEEK_IN_ORDER),
        startTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          ),
        endTime: z
          .string()
          .regex(
            /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
            "Time must be in the format HH:MM"
          ),
      })
    )
    .superRefine((availabilities, ctx) => {
      availabilities.forEach((availability, index) => {
        const overlaps = availabilities.some((a, i) => {
          return (
            i !== index &&
            a.dayOfWeek === availability.dayOfWeek &&
            TimeToInt(a.endTime) < TimeToInt(availability.startTime) &&
            TimeToInt(a.startTime) > TimeToInt(availability.endTime)
          );
        });

        if (overlaps) {
          ctx.addIssue({
            code: "custom",
            message: "Availability overlaps with another",
            path: [index],
          });
        }

        if (
          TimeToInt(availability.startTime) >= TimeToInt(availability.endTime)
        ) {
          ctx.addIssue({
            code: "custom",
            message: "End time must be after start time",
            path: [index],
          });
        }
      });
    }),
});
