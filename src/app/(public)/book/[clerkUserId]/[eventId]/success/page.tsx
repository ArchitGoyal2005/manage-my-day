import { db } from "@/drizzle/db";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
  searchParams: Promise<{ startTime: string }>;
}) {
  const { clerkUserId, eventId } = await params;
  const { startTime } = await searchParams;

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();

  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);

  const startTimeDate = new Date(startTime);

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>
          Successfully Booked {event.name} with {calendarUser.fullName}
        </CardTitle>
        <CardDescription>{formatDateTime(startTimeDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        You should receive an email confirmation shortly. You can safely close
        this page now.
      </CardContent>
    </Card>
  );
}
