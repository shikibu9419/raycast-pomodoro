import { Application, getPreferenceValues } from "@raycast/api";

interface Preferences {
  browser: Application;
  togglApiToken: string;
}

export const preferences = getPreferenceValues<Preferences>();
