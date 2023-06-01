import { Action, ActionPanel, List } from "@raycast/api";

import { preferences } from "../preferences";

export type PropTypes = {
  inputText: string;
  createTask: (listName: string, title: string, tracked: boolean) => void;
};

export default function EmptyTask({ inputText, createTask }: PropTypes) {
  return (
    <List.EmptyView
      icon="🗒️"
      title="No Matching Tasks"
      description={`Can't find a task matching ${inputText}.\nCreate it now!`}
      actions={
        <ActionPanel>
          <Action title="Create Task" onAction={() => createTask(preferences.defaultListName, inputText, false)} />
          <Action
            title="Create Task with Tracking"
            shortcut={{ modifiers: ["cmd"], key: "return" }}
            onAction={() => createTask(preferences.defaultListName, inputText, true)}
          />
        </ActionPanel>
      }
    />
  );
}
