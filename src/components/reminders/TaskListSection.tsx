import { useCallback, useMemo } from "react";
import { List, Icon, Color, ActionPanel, Action, showToast, Toast } from "@raycast/api";

import CreateTimeEntryForm from "../toggl/CreateTimeEntryForm";

import { AppContextProvider } from "../../context";
import { Reminder } from "../../reminders/model";
import { updateReminder } from "../../reminders/api";

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

function TaskListItem({
  task,
  toggleTaskCompleted,
}: {
  task: Reminder;
  toggleTaskCompleted: (task: Reminder) => void;
}) {
  return (
    <List.Item
      key={task.id}
      title={task.title}
      icon={{ source: Icon.Circle, tintColor: Color.Orange }}
      accessories={[{ text: task.notes }, ...(task.dueDate ? [{ date: task.dueDate }] : [])]}
      actions={
        <ActionPanel>
          <Action.Push
            title="Start task"
            icon={{ source: Icon.Clock }}
            target={
              <AppContextProvider>
                <CreateTimeEntryForm description={task.title} taskId={task.id} />
              </AppContextProvider>
            }
          />
          <Action
            title="Complete task"
            icon={{ source: Icon.Checkmark }}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
            onAction={() => toggleTaskCompleted(task)}
          />
        </ActionPanel>
      }
    />
  );
}

export default function TaskListSection({ tasks, onRefetch }: { tasks: Reminder[]; onRefetch: () => void }) {
  const toggleTaskCompleted = useCallback(async (task: Reminder) => {
    const rst = await updateReminder(task.id, { completed: !task.completed });
    if (rst.error) {
      await showToast(Toast.Style.Failure, "Failed to update task");
      return;
    }

    onRefetch();

    await showToast(Toast.Style.Success, "Task updated!");
  }, []);

  const todayTasks = useMemo(() => tasks.filter((task) => isToday(task.dueDate)), [tasks]);
  const inboxTasks = useMemo(() => tasks.filter((task) => !task.dueDate), [tasks]);

  return (
    <>
      <List.Section title="Today's Tasks">
        {todayTasks.map((task) => (
          <TaskListItem key={task.id} task={task} toggleTaskCompleted={toggleTaskCompleted} />
        ))}
      </List.Section>
      <List.Section title="Inbox Tasks">
        {inboxTasks.map((task) => (
          <TaskListItem key={task.id} task={task} toggleTaskCompleted={toggleTaskCompleted} />
        ))}
      </List.Section>
    </>
  );
}
