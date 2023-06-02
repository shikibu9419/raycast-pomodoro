import { List, Icon, ActionPanel, Action } from "@raycast/api";

import CreateTimeEntryForm from "./CreateTimeEntryForm";

import { AppContextProvider } from "../../context";
import { refreshStorage } from "../../storage";

export default function CreateTrackListItem() {
  return (
    <List.Item
      title="Create a new time entry"
      icon={"toggl-icon.png"}
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
  );
}
