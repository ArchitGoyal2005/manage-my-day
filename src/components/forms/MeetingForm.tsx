"use client";

import {
  formatDate,
  formatTimeString,
  formatTimezoneOffset,
} from "@/lib/formatters";
import { MeetingFormSchema } from "@/lib/schema/meetings";
import { cn } from "@/lib/utils";
import { createMeeting } from "@/server/actions/meetings";
import { zodResolver } from "@hookform/resolvers/zod";
import { isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function EventForm({
  validTimes,
  eventId,
  clerkUserId,
}: {
  validTimes: Date[];
  eventId: string;
  clerkUserId: string;
}) {
  const form = useForm<z.infer<typeof MeetingFormSchema>>({
    resolver: zodResolver(MeetingFormSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestName: "",
      guestEmail: "",
      guestNotes: "",
    },
  });

  const timezone = form.watch("timezone");
  const date = form.watch("date");

  const validTimesInTimezone = useMemo(() => {
    return validTimes.map((date) => toZonedTime(date, timezone));
  }, [validTimes, timezone]);

  async function onSubmit(values: z.infer<typeof MeetingFormSchema>) {
    const data = await createMeeting({ ...values, eventId, clerkUserId });

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your meeting",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Intl.supportedValuesOf("timeZone").map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                        {`   ${formatTimezoneOffset(timezone)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <FormItem className="flex-1">
                  <FormLabel>Date</FormLabel>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal flex w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        !validTimesInTimezone.some((time) =>
                          isSameDay(date, time)
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                  <FormMessage />
                </FormItem>
              </Popover>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={(value) =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          date == null || timezone == null
                            ? "Select a date/timezone first"
                            : "Select a meeting time"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter((time) => isSameDay(time, date))
                      .map((time) => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="guestNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
          >
            <Link href={`/book/${clerkUserId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
}
