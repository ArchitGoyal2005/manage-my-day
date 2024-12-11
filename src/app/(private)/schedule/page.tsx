import ScheduleForm from "@/components/forms/ScheduleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId, redirectToSignIn } = await auth();

  if (userId == null) return redirectToSignIn();

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: {
      availabilities: true,
    },
  });

  return (
    <div className="mx-auto m-4">
      <h2 className="text-4xl text-center font-semibold">
        When are you available to meet with people?
      </h2>
      <p className="text-gray-600 text-center pt-2">
        We&apos;ll automatically prevent meetings from being booked outside of
        your available hours.
      </p>
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  );
}
