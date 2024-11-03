"use server";
import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { ScheduleFormSchema } from "@/lib/schema/schedules";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";
import "use-server";
import { z } from "zod";

export async function saveSchedule(
  unsafeData: z.infer<typeof ScheduleFormSchema>
): Promise<{ error: boolean } | undefined> {
  const { userId } = await auth();
  const { success, data } = ScheduleFormSchema.safeParse(unsafeData);

  if (!success || userId == null) return { error: true };

  const { availabilities, ...scheduleData } = data;

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ ...scheduleData, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId,
      set: scheduleData,
    })
    .returning({ id: ScheduleTable.id });

  const statements: [BatchItem<"pg">] = [
    db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId)),
  ];

  if (availabilities.length > 0) {
    statements.push(
      db
        .insert(ScheduleAvailabilityTable)
        .values(
          availabilities.map((availability) => ({
            ...availability,
            scheduleId,
          }))
        )
    );
  }

  await db.batch(statements);
}
