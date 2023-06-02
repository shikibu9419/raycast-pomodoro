import { List, Icon, ActionPanel, Action, showToast, Toast, LocalStorage } from "@raycast/api";
import dayjs from "dayjs";
import { TimeEntry } from "../../toggl/types";
import useCurrentTime from "../../hooks/useCurrentTime";
import { storage } from "../../storage";
import toggl from "../../toggl";
import { useAppContext } from "../../context";
import { updateReminder } from "../../reminders/api";
import { pause } from "../../youtubemusic";

function RunningTimeEntry({ runningTimeEntry }: { runningTimeEntry: TimeEntry }) {
  const currentTime = useCurrentTime();
  const { projects } = useAppContext();
  const getProjectById = (id: number) => projects.find((p) => p.id === id);

  const stopTimeEntry = async () => {
    await showToast(Toast.Style.Animated, "Stopping time entry...");
    try {
      await toggl.stopTimeEntry({ id: runningTimeEntry.id });
      await storage.runningTimeEntry.refresh();
      const runningTaskId = await LocalStorage.getItem<string>("runningTaskId");
      if (runningTaskId) {
        await updateReminder(runningTaskId, { completed: true });
        LocalStorage.removeItem("runningTaskId");
      }
      pause();

      await showToast(Toast.Style.Success, `Stopped time entry`);
    } catch (e) {
      await showToast(Toast.Style.Failure, "Failed to stop time entry");
    }
  };

  return (
    <List.Section title="Running time entry" key="running-time-entry">
      <List.Item
        title={runningTimeEntry.description || "No description"}
        subtitle={
          (runningTimeEntry.billable ? "$  " : "") +
          dayjs.duration(dayjs(currentTime).diff(runningTimeEntry.start), "milliseconds").format("HH:mm:ss")
        }
        accessoryTitle={getProjectById(runningTimeEntry?.pid)?.name}
        accessoryIcon={{ source: Icon.Dot, tintColor: getProjectById(runningTimeEntry?.pid)?.hex_color }}
        icon={{ source: Icon.Clock, tintColor: getProjectById(runningTimeEntry?.pid)?.hex_color }}
        actions={
          <ActionPanel>
            <Action.SubmitForm icon={{ source: Icon.Clock }} onSubmit={stopTimeEntry} title="Stop Time Entry" />
          </ActionPanel>
        }
      />
    </List.Section>
  );
}

export default RunningTimeEntry;
