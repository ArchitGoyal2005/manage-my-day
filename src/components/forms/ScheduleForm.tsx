"use client";

import { DAY_OF_WEEK_IN_ORDER } from "@/lib/constants";
import { formatTimezoneOffset } from "@/lib/formatters";
import { ScheduleFormSchema } from "@/lib/schema/schedules";
import { TimeToInt } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { Fragment, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { saveSchedule } from "@/server/actions/schedules";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAY_OF_WEEK_IN_ORDER)[number];
};

export default function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<z.infer<typeof ScheduleFormSchema>>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => {
        return TimeToInt(a.startTime) - TimeToInt(b.startTime);
      }),
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.dayOfWeek
  );

  async function onSubmit(values: z.infer<typeof ScheduleFormSchema>) {
    const data = await saveSchedule(values);

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved!");
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
        {successMessage && (
          <div className="text-green-500 text-sm">{successMessage}</div>
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
        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAY_OF_WEEK_IN_ORDER.map((day) => (
            <Fragment key={day}>
              <div className="text-sm font-semibold capitalize">
                {day.substring(0, 3)}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="size-6 p-1"
                  variant="outline"
                  onClick={() => {
                    addAvailability({
                      dayOfWeek: day,
                      startTime: "9:00",
                      endTime: "17:00",
                    });
                  }}
                >
                  <Plus className="size-full" />
                </Button>

                {groupedAvailabilityFields[day]?.map((field, labelIndex) => (
                  <div className="flex flex-col gap-1" key={field.id}>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.startTime`}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${day} Start Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                      -
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.endTime`}
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${day} End Time ${
                                    labelIndex + 1
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                      <Button
                        type="button"
                        className="size-6 p-1"
                        variant="destructiveGhost"
                        onClick={() => removeAvailability(field.index)}
                      >
                        <X />
                      </Button>
                    </div>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.root?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.startTime?.message
                      }
                    </FormMessage>
                    <FormMessage>
                      {
                        form.formState.errors.availabilities?.at?.(field.index)
                          ?.endTime?.message
                      }
                    </FormMessage>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
