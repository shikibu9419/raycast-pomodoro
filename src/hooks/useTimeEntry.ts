import { LocalStorage, showToast, Toast, clearSearchBar, useNavigation } from "@raycast/api";

import { storage } from "../storage";
import toggl, { CreateTimeEntryParams } from "../toggl";

const defaultOptions: CreateTimeEntryParams = {
  billable: false,
  description: "",
  tags: [],
};

export function useTimeEntry() {
  const navigation = useNavigation();

  const createTimeEntry = async (
    description: string,
    taskId?: string,
    popOnCreate = false,
    options = defaultOptions
  ) => {
    try {
      await toggl.createTimeEntry({
        ...options,
        description,
      });
      if (taskId) LocalStorage.setItem("runningTaskId", taskId);
      await showToast(Toast.Style.Animated, "Starting time entry...");
      await storage.runningTimeEntry.refresh();
      await showToast(Toast.Style.Success, "Started time entry");

      if (popOnCreate) navigation.pop();

      await clearSearchBar();
    } catch (e) {
      await showToast(Toast.Style.Failure, "Failed to start time entry");
    }
  };

  return { createTimeEntry };
}
