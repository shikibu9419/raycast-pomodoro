import { environment } from "@raycast/api";
import { execa } from "execa";
import { join } from "path";
import { Reminder } from "./model";

type ReminderCommand =
  | "createList"
  | "createReminder"
  | "deleteReminder"
  | "getList"
  | "getLists"
  | "getReminder"
  | "getReminders"
  | "updateReminder";

export async function execCommand<T>(command: ReminderCommand, args: string[] = []): Promise<T> {
  // TODO: change
  // const { stdout } = await execa(join(environment.supportPath, command), args);
  const { stdout } = await execa(join("/Users/shikibu/.config/raycast/bin", command), args);

  return JSON.parse(stdout);
}

// YYYY-MM-DD
export const dateToString = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Takes an object and return an equivalent object with string dates converted to Date objects
 */
export const parseReminderDate = (reminder: Reminder): Reminder => ({
  ...reminder,
  creationDate: reminder.creationDate && new Date(reminder.creationDate),
  dueDate: reminder.dueDate && new Date(reminder.dueDate),
});
