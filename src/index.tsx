import { List } from "@raycast/api";

import {
  RunningTimeEntry,
  CreateTrackListItem,
  InvalidTokenListItem,
  ProjectListItem,
  TimeEntriesWithUniqueProjectAndDescriptionSection,
} from "./components/toggl";

import { AppContextProvider, useAppContext } from "./context";

function ListView() {
  const { isLoading, isValidToken, projectGroups, runningTimeEntry } = useAppContext();

  return (
    <List isLoading={isLoading} throttle>
      {isValidToken || <InvalidTokenListItem />}
      {isValidToken && !isLoading && (
        <>
          {runningTimeEntry && <RunningTimeEntry runningTimeEntry={runningTimeEntry} />}
          <List.Section title="Actions">
            <CreateTrackListItem />
          </List.Section>
          {TimeEntriesWithUniqueProjectAndDescriptionSection}
          <List.Section title="Projects">
            {projectGroups &&
              projectGroups.map((group) =>
                group.projects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    subtitle={group.client?.name}
                    accessoryTitle={group.workspace.name}
                  />
                ))
              )}
          </List.Section>
        </>
      )}
    </List>
  );
}

export default function Command() {
  return (
    <AppContextProvider>
      <ListView />
    </AppContextProvider>
  );
}
