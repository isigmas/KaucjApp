import React from "react";

import ProfileDetailsScreen from "@/src/components/standalone-screens/profile-details-screen";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/use-auth";
import ErrorState from "@/src/components/states/error-state";

export default function ProfileDetailsSheet() {
  const { user } = useAuth();
  if (!user) {
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
      userId={String(user.userId)}
      role="creator"
      color="primary"
    />
  );
}
