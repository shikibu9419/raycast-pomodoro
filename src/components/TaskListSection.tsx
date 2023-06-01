import { useMemo } from "react";
import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";

import CreateTimeEntryForm from "./CreateTimeEntryForm";

import { AppContextProvider } from "../context";
import { Reminder } from "../reminders/model";

const isToday = (date: Date) => {
  return date && date.getDate() === 1 && date.getMonth() === 5 && date.getFullYear() === 2023;
};

function TaskListItem({ task }: { task: Reminder }) {
  return (
    <List.Item
      key={task.id}
      title={task.title}
      icon={{ source: Icon.Circle, tintColor: Color.Orange }}
      accessories={[{ text: task.notes }, ...(task.dueDate ? [{ date: task.dueDate }] : [])]}
      actions={
        <ActionPanel>
          <Action.Push
            title="Create Time Entry"
            icon={{ source: Icon.Clock }}
            target={
              <AppContextProvider>
                <CreateTimeEntryForm description={task.title} taskId={task.id} />
              </AppContextProvider>
            }
          />
        </ActionPanel>
      }
    />
  );
}

export default function TaskListSection({ tasks }: { tasks: Reminder[] }) {
  const todayTasks = useMemo(() => tasks.filter((reminder) => isToday(reminder.dueDate)), [tasks]);
  const inboxTasks = useMemo(() => tasks.filter((reminder) => !reminder.dueDate), [tasks]);

  return (
    <>
      <List.Section title="Today's Tasks">
        {todayTasks.map((task) => (
          <TaskListItem key={task.id} task={task} />
        ))}
      </List.Section>
      <List.Section title="Inbox Tasks">
        {inboxTasks.map((task) => (
          <TaskListItem key={task.id} task={task} />
        ))}
      </List.Section>
    </>
  );
}
