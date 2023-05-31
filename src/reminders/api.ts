import { ReminderList, Reminder, ReminderParams } from "./model";
import { dateToString, execCommand, parseReminderDate } from "./utils";

interface Response<T = null> {
  data: T;
  error: string;
}

export async function getReminderLists(): Promise<ReminderList[]> {
  const res = await execCommand<Response<ReminderList[]>>("getLists");

  if (res.error) throw new Error(res.error);

  return res.data;
}

export async function getReminders(listName: string): Promise<Reminder[]> {
  const res = await execCommand<Response<Reminder[]>>("getReminders", [listName, "true"]);

  if (res.error) throw new Error(res.error);

  return res.data.map(parseReminderDate);
}

export function updateReminder(id: string, params: ReminderParams): Promise<Response> {
  return execCommand<Response>("updateReminder", [
    id,
    params.title,
    params.notes,
    dateToString(params.dueDate),
    params.priority.toString(),
  ]);
}

export function deleteReminder(id: string): Promise<Response> {
  return execCommand<Response>("deleteReminder", [id]);
}

export function createReminder(listName: string, params: ReminderParams): Promise<Response> {
  return execCommand<Response>("createReminder", [
    listName,
    params.title,
    params.notes,
    dateToString(params.dueDate),
    params.priority.toString(),
  ]);
}
