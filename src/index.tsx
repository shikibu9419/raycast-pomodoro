import { List } from "@raycast/api";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import RunningTimeEntry from "./components/RunningTimeEntry";
import CreateTrackListItem from "./components/CreateTrackListItem";
import InvalidTokenListItem from "./components/InvalidTokenListItem";
import ProjectListItem from "./components/ProjectListItem";
import TimeEntriesWithUniqueProjectAndDescriptionSection from "./components/TimeEntriesWithUniqueProjectAndDescriptionSection";
import { AppContextProvider, useAppContext } from "./context";

dayjs.extend(duration);

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
