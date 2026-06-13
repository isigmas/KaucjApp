import React from "react";

import ProfileDetailsScreen from "@/src/components/standalone-screens/profile-details-screen";
import { router, useLocalSearchParams } from "expo-router";
import ErrorState from "@/src/components/states/error-state";

export default function ProfileDetailsSheet() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  if (!userId) {
    return (
      <ErrorState
        title="Wystąpił błąd"
        message="Nie udało się załadować danych."
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <ProfileDetailsScreen
      userId={userId}
      role="creator"
      color="primary"
      showDetailedStats={true}
    />
  );
}
