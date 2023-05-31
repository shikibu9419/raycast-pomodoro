import { Suspense, useCallback } from "react";
import { Color, Icon, List } from "@raycast/api";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { AppContextProvider, useAppContext } from "./context";
import { getReminders } from './reminders/api';
import { Reminder, ReminderList } from './reminders/model';

const queryClient = new QueryClient();

function EmptyList() {
  return (
    <List isLoading></List>
  );
}

// export default function ReminderList() {
function ReminderList() {
  const getRemindersWrapper = useCallback(() => getReminders('リマインダー'), [])

  const { data } = useQuery<Reminder[]>(['reminders'], getRemindersWrapper);

  return (
    <List>
      {data?.map((item) => (
        <List.Item key={item.id} title={item.title}
        icon={{ source: Icon.Circle, tintColor: Color.Orange }}
         accessories={[
          { text: item.notes, icon: item.notes ? Icon.Pencil : '' },
          { date: item.dueDate },
        ]} />
      ))}
    </List>
  );
}

export default function Command() {
  const { isLoading, isValidToken, projectGroups, runningTimeEntry, timeEntries, projects } = useAppContext();

  return (
    <AppContextProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<EmptyList />}>
            <ReminderList />
        </Suspense>
      </QueryClientProvider>
    </AppContextProvider>
  );
}
