import React from "react";

import ProfileDetailsScreen from "@/src/components/standalone-screens/profile-details-screen";
import { useLocalSearchParams } from "expo-router";

export default function ProfileDetailsSheet() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return <ProfileDetailsScreen userId={userId} role="creator" />;
}
