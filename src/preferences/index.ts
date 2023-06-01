import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  togglApiToken: string;
  defaultListName: string;
}

export const preferences = getPreferenceValues<Preferences>();
