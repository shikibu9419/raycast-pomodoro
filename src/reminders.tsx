import { Suspense, useCallback, useMemo, useState } from "react";
import { List, Toast, showToast } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { EmptyTask, TaskListSection } from "./components/reminders";
import { InvalidTokenListItem, RunningTimeEntry, CreateTrackListItem } from "./components/toggl";

import { AppContextProvider, useAppContext } from "./context";
import { useTimeEntry } from "./hooks/useTimeEntry";
import { preferences } from "./preferences";
import { createReminder, getReminders, updateReminder } from "./reminders/api";
import { Reminder } from "./reminders/model";
import { isSameDate, isIncoming, isExpired } from "./lib";

dayjs.extend(duration);

const queryClient = new QueryClient();

function RemindersList() {
  const { isLoading, isValidToken, runningTimeEntry } = useAppContext();
  const [inputText, setInputText] = useState("");
  const { createTimeEntry } = useTimeEntry();

  const handleInputTextChange = useCallback((value: string) => {
    setInputText(value);
  }, []);
  const getRemindersWrapper = useCallback(() => getReminders(preferences.defaultListName), []);

  const updateTask = useCallback(async (task: Reminder) => {
    const rst = await updateReminder(task.id, task);
    if (rst.error) {
      await showToast(Toast.Style.Failure, "Failed to update task");
      return;
    }

    refetch();

    await showToast(Toast.Style.Success, "Task updated!");
  }, []);

  const createTask = useCallback(async (listName: string, title: string, tracked: boolean) => {
    const { data } = await createReminder(listName, { title, dueDate: new Date() });
    if (tracked) createTimeEntry(title, data.id);

    await showToast(Toast.Style.Success, "Task created!");
  }, []);

  const { data, refetch } = useQuery<Reminder[]>(["reminders"], getRemindersWrapper);

  const today = useMemo(() => new Date(), []);
  const todayTasks = useMemo(() => data?.filter((task) => isSameDate(task.dueDate, today)), [data]);
  const inboxTasks = useMemo(() => data?.filter((task) => !task.dueDate), [data]);
  const incomingTasks = useMemo(() => data?.filter((task) => isIncoming(task.dueDate, today, true)), [data]);
  const expiredTasks = useMemo(() => data?.filter((task) => isExpired(task.dueDate, today)), [data]);

  return (
    <List isLoading={isLoading} searchText={inputText} onSearchTextChange={handleInputTextChange} enableFiltering>
      {!isValidToken && <InvalidTokenListItem />}
      {isValidToken && !isLoading && runningTimeEntry && <RunningTimeEntry runningTimeEntry={runningTimeEntry} />}
      {todayTasks && <TaskListSection title="Today" tasks={todayTasks} onUpdateTask={updateTask} />}
      {inboxTasks && <TaskListSection title="Inbox" tasks={inboxTasks} onUpdateTask={updateTask} />}
      {incomingTasks && <TaskListSection title="Incoming" tasks={incomingTasks} onUpdateTask={updateTask} />}
      {expiredTasks && <TaskListSection title="Expired" tasks={expiredTasks} onUpdateTask={updateTask} />}
      {isValidToken && !isLoading && (
        <List.Section title="Toggl">
          <CreateTrackListItem />
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
          <RemindersList />
        </Suspense>
      </QueryClientProvider>
    </AppContextProvider>
  );
}
