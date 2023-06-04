import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";

import CreateTimeEntryForm from "../toggl/CreateTimeEntryForm";

import { AppContextProvider } from "../../context";
import { getToday } from "../../lib";
import { Reminder } from "../../reminders/model";
import { useCallback } from "react";

const urlsInText = (text: string): string[] => text.match(/(https?:\/\/[^\s]+)/g) || [];

function TaskListItem({
  task,
  onUpdateTask,
  onPostponeTask,
}: {
  task: Reminder;
  onUpdateTask: (task: Reminder) => void;
  onPostponeTask: (task: Reminder) => void;
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
            onAction={() => onUpdateTask({ ...task, completed: true })}
          />
          <Action
            title="Postpone Tomorrow"
            icon={{ source: Icon.Calendar }}
            shortcut={{ modifiers: ["cmd"], key: "p" }}
            onAction={() => onPostponeTask(task)}
          />
          {urlsInText(task.notes) && (
            <Action.OpenInBrowser
              title="Open Link"
              icon={{ source: Icon.Link }}
              shortcut={{ modifiers: ["cmd"], key: "l" }}
              url={urlsInText(task.notes)[0]}
            />
          )}
        </ActionPanel>
      }
    />
  );
}

export default function TaskListSection({
  title,
  tasks,
  onUpdateTask,
}: {
  title: string;
  tasks: Reminder[];
  onUpdateTask: (task: Reminder) => void;
}) {
  const postPoneToTommorow = useCallback((task: Reminder) => {
    const today = getToday();
    console.log(today);
    if (!task.dueDate) task.dueDate = today;
    task.dueDate.setDate(today.getDate() + 1);

    onUpdateTask(task);
  }, []);

  return (
    <>
      <List.Section title={`${title} (${tasks.length} Tasks)`}>
        {tasks.map((task) => (
          <TaskListItem key={task.id} task={task} onUpdateTask={onUpdateTask} onPostponeTask={postPoneToTommorow} />
        ))}
      </List.Section>
    </>
  );
}
