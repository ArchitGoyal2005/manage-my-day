import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const { userId } = await auth();
  if (userId != null) redirect("/events");

  return (
    <div className="mx-auto text-center container my-4">
      <h1 className="text-3xl mb-4">Fancy Home Page</h1>
      <div className="flex gap-2 justify-center">
        <Button asChild>
          <SignInButton />
        </Button>
        <Button asChild>
          <SignUpButton />
        </Button>
        <UserButton />
      </div>
    </div>
  );
}
