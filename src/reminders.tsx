import { Suspense, useCallback, useMemo, useState } from "react";
import { Action, ActionPanel, Color, Icon, List, Toast, clearSearchBar, showToast } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { AppContextProvider, useAppContext } from "./context";
import { createReminder, getReminders } from "./reminders/api";
import { Reminder, ReminderList } from "./reminders/model";
import CreateTimeEntryForm from "./components/CreateTimeEntryForm";
import EmptyTask from "./components/EmptyTask";
import RunningTimeEntry from "./components/RunningTimeEntry";
import { storage, refreshStorage } from "./storage";
import toggl from "./toggl";
import { TimeEntry } from "./toggl/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { preferences } from "./preferences";
import { useTimeEntry } from "./hooks/useTimeEntry";

dayjs.extend(duration);

const queryClient = new QueryClient();

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

function TaskListSection({ tasks }: { tasks: Reminder[] }) {
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

function ReminderList() {
  const { isLoading, isValidToken, projectGroups, runningTimeEntry, timeEntries, projects } = useAppContext();
  const [inputText, setInputText] = useState("");
  const { createTimeEntry } = useTimeEntry();

  const handleInputTextChange = useCallback((value: string) => {
    setInputText(value);
  }, []);
  const getRemindersWrapper = useCallback(() => getReminders(preferences.defaultListName), []);

  const createTask = useCallback(async (listName: string, title: string, tracked: boolean) => {
    const { data } = await createReminder(listName, { title, dueDate: new Date() });
    if (tracked) createTimeEntry(title, data.id);

    await showToast(Toast.Style.Success, "Task created!");
  }, []);

  const { data } = useQuery<Reminder[]>(["reminders"], getRemindersWrapper);

  return (
    <List isLoading={isLoading} searchText={inputText} onSearchTextChange={handleInputTextChange} enableFiltering>
      {isValidToken ? (
        !isLoading && runningTimeEntry && <RunningTimeEntry runningTimeEntry={runningTimeEntry} />
      ) : (
        <List.Item
          icon={Icon.ExclamationMark}
          title="Invalid API Key Detected"
          accessories={[{ text: `Go to Extensions → Toggl Track` }]}
        />
      )}
      {data && <TaskListSection tasks={data} />}
      {isValidToken && !isLoading && (
        <List.Section title="Toggl">
          <List.Item
            title="Create a new time entry"
            icon={"command-icon.png"}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Create Time Entry"
                  icon={{ source: Icon.Clock }}
                  target={
                    <AppContextProvider>
                      <CreateTimeEntryForm />
                    </AppContextProvider>
                  }
                />
                <ActionPanel.Section>
                  <Action.SubmitForm
                    title="Refresh"
                    icon={{ source: Icon.RotateClockwise }}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                    onSubmit={refreshStorage}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        </List.Section>
      )}
      <EmptyTask inputText={inputText} createTask={createTask} />
    </List>
  );
}

export default function Command() {
  return (
    <AppContextProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<List isLoading />}>
          <ReminderList />
        </Suspense>
      </QueryClientProvider>
    </AppContextProvider>
  );
}
