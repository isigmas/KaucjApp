import { View, Text } from "react-native";
import React from "react";

interface UserReviewCheckProps {
  userId: number | null;
}
export default function UserReviewCheck({ userId }: UserReviewCheckProps) {
  if (!userId) {
    return null;
  }

  return (
    <View>
      <Text>UserReviewCheck</Text>
    </View>
  );
}
