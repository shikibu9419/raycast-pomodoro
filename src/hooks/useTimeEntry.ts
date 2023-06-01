import { LocalStorage, showToast, Toast, clearSearchBar, useNavigation } from "@raycast/api";

import { storage } from "../storage";
import toggl, { CreateTimeEntryParams } from "../toggl";
import { TimeEntry } from "../toggl/types";
import { useAppContext } from "../context";
import { useMemo } from "react";

const defaultOptions: CreateTimeEntryParams = {
  billable: false,
  description: "",
  tags: [],
};

export function useTimeEntry() {
  const { timeEntries } = useAppContext();
  const navigation = useNavigation();

  const timeEntriesWithUniqueProjectAndDescription = useMemo(
    () =>
      timeEntries
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .reduce(
          (acc, timeEntry) =>
            acc.find((t) => t.description === timeEntry.description && t.pid === timeEntry.pid)
              ? acc
              : [...acc, timeEntry],
          [] as TimeEntry[]
        ),
    [timeEntries]
  );

  const createTimeEntry = async (description: string, taskId?: string, options = defaultOptions) => {
    try {
      await toggl.createTimeEntry({
        ...options,
        description,
      });
      if (taskId) LocalStorage.setItem("runningTaskId", taskId);
      await showToast(Toast.Style.Animated, "Starting time entry...");
      await storage.runningTimeEntry.refresh();
      await showToast(Toast.Style.Success, "Started time entry");
      navigation.pop();
      await clearSearchBar();
    } catch (e) {
      await showToast(Toast.Style.Failure, "Failed to start time entry");
    }
  };

  const resumeTimeEntry = async (timeEntry: TimeEntry) => {
    await showToast(Toast.Style.Animated, "Starting timer...");
    try {
      await toggl.createTimeEntry({
        projectId: timeEntry.pid,
        description: timeEntry.description,
        tags: timeEntry.tags,
        billable: timeEntry.billable,
      });
      await storage.runningTimeEntry.refresh();
      await showToast(Toast.Style.Success, "Time entry resumed");
      await clearSearchBar({ forceScrollToTop: true });
    } catch (e) {
      await showToast(Toast.Style.Failure, "Failed to resume time entry");
    }
  };

  return { createTimeEntry, resumeTimeEntry, timeEntriesWithUniqueProjectAndDescription };
}
