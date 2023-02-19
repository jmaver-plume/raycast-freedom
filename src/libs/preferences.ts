import { getPreferenceValues } from "@raycast/api";

export interface IPreferences {
  cookie: string;
  xCsrfToken: string;
}

export function getPreferences() {
  return getPreferenceValues<IPreferences>();
}
