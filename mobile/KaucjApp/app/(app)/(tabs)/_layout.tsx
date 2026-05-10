import { colors } from "@/src/theme";

import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeTabs minimizeBehavior="automatic">
        <NativeTabs.Trigger name="home">
          <Label>Mapa</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "map", selected: "map.fill" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="create">
          <Label>Dodaj</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>Profil</Label>
          <Icon
            selectedColor={colors.primary.base}
            sf={{ default: "person", selected: "person.fill" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </GestureHandlerRootView>
  );
}
