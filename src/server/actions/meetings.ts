"use server";

import { db } from "@/drizzle/db";
import getValidTimesFromSchedule from "@/lib/getValidTimesFromSchedule";
import { MeetingActionSchema } from "@/lib/schema/meetings";
import "use-server";
import { createCalendarEvent } from "../googleCalendar";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";

export async function createMeeting(
  unsafeData: z.infer<typeof MeetingActionSchema>
): Promise<{ error: boolean } | undefined> {
  const { success, data } = MeetingActionSchema.safeParse(unsafeData);

  if (!success) return { error: true };

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { eq, and }) =>
      and(
        eq(clerkUserId, data.clerkUserId),
        eq(isActive, true),
        eq(id, data.eventId)
      ),
  });

  if (event == null) return { error: true };

  const startInTimezone = fromZonedTime(data.startTime, data.timezone);

  const validTimes = await getValidTimesFromSchedule([startInTimezone], event);

  if (validTimes.length === 0) return { error: true };

  await createCalendarEvent({
    ...data,
    startTime: startInTimezone,
    durationInMinutes: event.durationInMinutes,
    eventName: event.name,
  });

  redirect(
    `/book/${data.clerkUserId}/${
      data.eventId
    }/success?startTime=${data.startTime.toISOString()}`
  );
}
