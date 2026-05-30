import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInUp,
  LinearTransition,
} from "react-native-reanimated";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { useUserReviews, useMachineReviews } from "@/src/api/hooks/use-rating";
import LoadingState from "../../states/loading-state";
import { Review } from "@/src/types";
import { timeAgoInPolish } from "@/src/lib";
import { layoutSpring } from "@/src/constants";
import ReviewCard from "./review-list-card";

export interface ReviewsSectionProps {
  userId?: number;
  machineId?: number;
}

export default function ReviewsSection({
  userId,
  machineId,
}: ReviewsSectionProps) {
  if (userId !== undefined) {
    return <UserReviews userId={userId} />;
  }

  if (machineId !== undefined) {
    return <MachineReviews machineId={machineId} />;
  }

  console.warn("ReviewsSection requires either a userId or a machineId.");
  return null;
}

function UserReviews({ userId }: { userId: number }) {
  const { data: reviews, isLoading } = useUserReviews(userId);
  return <ReviewsList reviews={reviews} isLoading={isLoading} />;
}

function MachineReviews({ machineId }: { machineId: number }) {
  const { data: reviews, isLoading } = useMachineReviews(machineId);
  return <ReviewsList reviews={reviews} isLoading={isLoading} />;
}

interface ReviewsListProps {
  reviews?: Review[];
  isLoading: boolean;
}

function ReviewsList({ reviews, isLoading }: ReviewsListProps) {
  const hasReviews = reviews && reviews.length > 0;
  if (isLoading) {
    return <LoadingState title="Ładowanie opinii..." />;
  }

  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionTitle}
      >
        Opinie
      </Animated.Text>

      {hasReviews ? (
        <View style={styles.listContainer}>
          {reviews.map((review, index) => (
            <ReviewCard key={review.reviewId} review={review} index={index} />
          ))}
        </View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.emptyContainer}
        >
          <Text style={styles.emptyText}>Brak opinii.</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  listContainer: {
    gap: spacing.md,
  },

  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: rounded.apple || 16,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: "500",
  },
});
