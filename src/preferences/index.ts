import { Application, getPreferenceValues } from "@raycast/api";

interface Preferences {
  browser: Application;
  extensionPath: string;
  togglApiToken: string;
}

export const preferences = getPreferenceValues<Preferences>();
