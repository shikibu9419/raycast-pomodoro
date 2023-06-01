import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { AppContextProvider, useAppContext } from "./context";
import RunningTimeEntry from "./components/RunningTimeEntry";
import { ActionPanel, clearSearchBar, Icon, List, Action, showToast, Toast } from "@raycast/api";
import { TimeEntry } from "./toggl/types";
import toggl from "./toggl";
import { storage, refreshStorage } from "./storage";
import ProjectListItem from "./components/ProjectListItem";
import CreateTimeEntryForm from "./components/CreateTimeEntryForm";
import { useTimeEntry } from "./hooks/useTimeEntry";
import TimeEntriesWithUniqueProjectAndDescriptionSection from "./components/TimeEntriesWithUniqueProjectAndDescriptionSection";
import CreateTrackListItem from "./components/CreateTrackListItem";

dayjs.extend(duration);

function ListView() {
  const { isLoading, isValidToken, projectGroups, runningTimeEntry, projects } = useAppContext();

  return (
    <List isLoading={isLoading} throttle>
      {isValidToken ? (
        !isLoading && (
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
        )
      ) : (
        <List.Item
          icon={Icon.ExclamationMark}
          title="Invalid API Key Detected"
          accessoryTitle={`Go to Extensions → Toggl Track`}
        />
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
