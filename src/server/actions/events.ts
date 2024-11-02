"use server";

import { EventFormSchema } from "@/lib/schema/events";
import { z } from "zod";
import "use-server";
import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createEvent(
  unsafeData: z.infer<typeof EventFormSchema>
): Promise<{ error: boolean } | undefined> {
  const { userId } = await auth();
  const { success, data } = EventFormSchema.safeParse(unsafeData);

  if (!success || userId == null) return { error: true };

  await db.insert(EventTable).values({ ...data, clerkUserId: userId });

  redirect("/events");
}
