import dayjs from "dayjs";
import { execa } from "execa";
import { join } from "path";

import { ReminderList, Reminder, ReminderParams } from "./model";
import { dateToString } from "../lib";
import { preferences } from "../preferences";

interface Response<T = null> {
  data: T;
  error: string;
}

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
  const commandPath = join(`${preferences.extensionPath}/bin`, command);
  console.log("Exec Command:", commandPath, args);
  const { stdout } = await execa(commandPath, args);

  console.log(">", stdout);

  return JSON.parse(stdout);
}

/**
 * Takes an object and return an equivalent object with string dates converted to Date objects
 */
export const parseReminderDate = (reminder: Reminder): Reminder => ({
  ...reminder,
  creationDate: reminder.creationDate && dayjs(reminder.creationDate).tz(),
  dueDate: reminder.dueDate && dayjs(reminder.dueDate).tz(),
});

export async function getReminderLists(): Promise<ReminderList[]> {
  const res = await execCommand<Response<ReminderList[]>>("getLists");

  if (res.error) throw new Error(res.error);

  return res.data;
}

export async function getReminders(): Promise<Reminder[]> {
  const params = {
    completed: false,
  };
  const res = await execCommand<Response<Reminder[]>>("getReminders", [JSON.stringify(params)]);

  if (res.error) throw new Error(res.error);

  return res.data.map(parseReminderDate);
}

export function updateReminder(id: string, params: ReminderParams): Promise<Response> {
  return execCommand<Response>("updateReminder", [
    id,
    JSON.stringify({ ...params, ...(params.dueDate ? { dueDate: dateToString(params.dueDate) } : {}) }),
  ]);
}

export function deleteReminder(id: string): Promise<Response> {
  return execCommand<Response>("deleteReminder", [id]);
}

export function createReminder(listName: string, params: ReminderParams): Promise<Response<Reminder>> {
  return execCommand<Response<Reminder>>("createReminder", [
    listName,
    params.title || "",
    params.notes || "",
    params.dueDate ? dateToString(params.dueDate) : "",
    params.priority?.toString() || "0",
  ]);
}
