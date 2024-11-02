import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";

export default async function page() {
  const { userId, redirectToSignIn } = await auth();

  if (userId == null) return redirectToSignIn();

  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
  return (
    <>
      <div className="flex gap-4 items-baseline">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl mb-6 font-semibold">
          Events
        </h1>
        <Button asChild>
          <Link href="/events/new">
            <CalendarPlus className="size-8" />
            New Event
          </Link>
        </Button>
      </div>
      {events?.length > 0 ? (
        <></>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-4">
          <CalendarRange className="size-16 mx-auto" />
          <p className="text-center text-lg">
            You do not have any events yet. Create your first event to get
            started!
          </p>
          <Button size="lg" className="text-lg" asChild>
            <Link href="/events/new">
              <CalendarPlus className="size-12" />
              New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
