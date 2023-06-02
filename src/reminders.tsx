import { Suspense, useCallback, useState } from "react";
import { List, Toast, showToast } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { EmptyTask, TaskListSection } from "./components/reminders";
import { InvalidTokenListItem, RunningTimeEntry, CreateTrackListItem } from "./components/toggl";

import { AppContextProvider, useAppContext } from "./context";
import { useTimeEntry } from "./hooks/useTimeEntry";
import { preferences } from "./preferences";
import { createReminder, getReminders } from "./reminders/api";
import { Reminder } from "./reminders/model";

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

  const createTask = useCallback(async (listName: string, title: string, tracked: boolean) => {
    const { data } = await createReminder(listName, { title, dueDate: new Date() });
    if (tracked) createTimeEntry(title, data.id);

    await showToast(Toast.Style.Success, "Task created!");
  }, []);

  const { data, refetch } = useQuery<Reminder[]>(["reminders"], getRemindersWrapper);

  return (
    <List isLoading={isLoading} searchText={inputText} onSearchTextChange={handleInputTextChange} enableFiltering>
      {!isValidToken && <InvalidTokenListItem />}
      {isValidToken && !isLoading && runningTimeEntry && <RunningTimeEntry runningTimeEntry={runningTimeEntry} />}
      {data && <TaskListSection tasks={data} onRefetch={refetch} />}
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
