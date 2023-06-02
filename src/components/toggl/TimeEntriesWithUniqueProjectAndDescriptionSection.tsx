import { useCallback, useMemo } from "react";
import { List, Icon, ActionPanel, Action, Toast, clearSearchBar, showToast } from "@raycast/api";

import { useAppContext } from "../../context";
import { refreshStorage, storage } from "../../storage";
import toggl from "../../toggl";
import { TimeEntry } from "../../toggl/types";

export default function TimeEntriesWithUniqueProjectAndDescriptionSection() {
  const { timeEntries, projects } = useAppContext();

  const getProjectById = useCallback((id: number) => projects.find((p) => p.id === id), []);

  const resumeTimeEntry = useCallback(async (timeEntry: TimeEntry) => {
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
  }, []);

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

  return (
    <List.Section title="Resume recent time entry">
      {timeEntriesWithUniqueProjectAndDescription.map((timeEntry) => (
        <List.Item
          key={timeEntry.id}
          keywords={[timeEntry.description, getProjectById(timeEntry.pid)?.name || ""]}
          title={timeEntry.description || "No description"}
          subtitle={timeEntry.billable ? "$" : ""}
          accessoryTitle={getProjectById(timeEntry?.pid)?.name}
          accessoryIcon={{ source: Icon.Dot, tintColor: getProjectById(timeEntry?.pid)?.hex_color }}
          icon={{ source: Icon.Circle, tintColor: getProjectById(timeEntry?.pid)?.hex_color }}
          actions={
            <ActionPanel>
              <Action.SubmitForm
                title="Resume Time Entry"
                onSubmit={() => resumeTimeEntry(timeEntry)}
                icon={{ source: Icon.Clock }}
              />
              <Action.SubmitForm title="Refresh" icon={{ source: Icon.RotateClockwise }} onSubmit={refreshStorage} />
            </ActionPanel>
          }
        />
      ))}
    </List.Section>
  );
}
