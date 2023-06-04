import { Application, getPreferenceValues } from "@raycast/api";

interface Preferences {
  browser: Application;
  defaultListName: string;
  togglApiToken: string;
}

export const preferences = getPreferenceValues<Preferences>();
