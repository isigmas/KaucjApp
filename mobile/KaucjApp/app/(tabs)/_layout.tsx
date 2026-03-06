import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Label>Mapa</Label>
        <Icon sf={{ default: "map", selected: "map.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tab2">
        <Label>tab2</Label>
        <Icon sf={{ default: "book", selected: "book.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profil</Label>
        <Icon sf={{ default: "person", selected: "person.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
