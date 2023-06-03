import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";

import CreateTimeEntryForm from "../toggl/CreateTimeEntryForm";

import { AppContextProvider } from "../../context";
import { Reminder } from "../../reminders/model";

function TaskListItem({ task, onCompleteTask }: { task: Reminder; onCompleteTask: (task: Reminder) => void }) {
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
            onAction={() => onCompleteTask(task)}
          />
        </ActionPanel>
      }
    />
  );
}

export default function TaskListSection({
  title,
  tasks,
  onCompleteTask,
}: {
  title: string;
  tasks: Reminder[];
  onCompleteTask: (task: Reminder) => void;
}) {
  return (
    <>
      <List.Section title={`${title} (${tasks.length} Tasks)`}>
        {tasks.map((task) => (
          <TaskListItem key={task.id} task={task} onCompleteTask={onCompleteTask} />
        ))}
      </List.Section>
    </>
  );
}
