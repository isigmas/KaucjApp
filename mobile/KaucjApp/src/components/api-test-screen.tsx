import { View, Text } from "react-native";
import React from "react";
import { useAuth } from "../auth/use-auth";
import { useGetOffers } from "../api/hooks/use-offer";

export default function ApiTestScreen() {
  const { user } = useAuth();
  const { data: offers } = useGetOffers();

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Nie ma usera</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{user?.name || "Guest"}</Text>
      <Text>{offers?.length || 0} ofert</Text>
    </View>
  );
}
