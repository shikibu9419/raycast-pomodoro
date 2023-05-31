export interface ReminderList {
  name: string;
  id: string;
}

export interface Reminder {
  title: string;
  notes: string;
  id: string;
  completed: boolean;
  creationDate: Date;
  dueDate: Date;
  priority: number;
}

export type ReminderParams = Pick<Reminder, "title" | "notes" | "dueDate" | "priority">;
