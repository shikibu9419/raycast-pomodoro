import { List, Icon } from "@raycast/api";

export default function InvalidTokenListItem() {
  return (
    <List.Item
      icon={Icon.ExclamationMark}
      title="Invalid API Key Detected"
      accessories={[{ text: `Go to Extensions → Toggl Track` }]}
    />
  );
}
