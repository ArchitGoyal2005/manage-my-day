import Image from "next/image"; // Import Image correctly
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const { userId } = await auth();
  if (userId != null) redirect("/events");

  return (
    <div className="m-2">
      <div className="flex justify-between py-3 px-2 shadow-md border rounded-md">
        <h1 className="text-3xl mt-2 ml-12 font-sans font-bold text-blue-800">
          <span>Apoint</span>
          <span className="text-yellow-400">Me</span>
        </h1>
        <div className="flex gap-2 justify-center">
          <Button
            className="h-10 w-28 border rounded-3xl bg-blue-800 hover:bg-blue-600"
            asChild
          >
            <SignInButton />
          </Button>
          <Button
            className="h-10 w-28 border rounded-3xl text-blue-800 bg-white border-s-2 hover:bg-gray-200"
            asChild
          >
            <SignUpButton />
          </Button>
          <UserButton />
        </div>
      </div>
      <div className="flex h-5/6 gap-4 justify-between">
        <div className="py-40 text-6xl font-sans font-bold flex flex-col ml-12 text-gray-800">
          <span className="py-4">Easy </span>
          <span className="py-4">scheduling </span>
          <span className="py-4">ahead </span>

          <p className="text-xl py-4 font-sans font-normal text-gray-800">
            Professionals who easily book meetings with AppointMe
          </p>
        </div>
        <div>
          <Image
            src="/person.png" // Correct path to image in the public directory
            alt="Person scheduling"
            width={700} // Set appropriate width
            height={700} // Set appropriate height
          />
        </div>
      </div>
    </div>
  );
}
