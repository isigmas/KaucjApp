import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, rounded, spacing } from "@/src/theme";
import { useUserReviews, useMachineReviews } from "@/src/api/hooks/use-rating";
import LoadingState from "../../states/loading-state";
import { Review } from "@/src/types";
import { timeAgoInPolish } from "@/src/lib";

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
  if (isLoading) {
    return <LoadingState title="Ładowanie opinii..." />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyText}>Brak opinii.</Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionTitle}
      >
        Opinie
      </Animated.Text>

      <View style={styles.listContainer}>
        {reviews.map((review, index) => (
          <ReviewCard key={review.reviewId} review={review} index={index} />
        ))}
      </View>
    </View>
  );
}

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100).springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.reviewerName} numberOfLines={1}>
          {review.reviewerUsername}
        </Text>
        <Text style={styles.dateText}>{timeAgoInPolish(review.createdAt)}</Text>
      </View>

      <View style={styles.starsRow}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < review.score ? "star" : "star-outline"}
            size={14}
            color={colors.status?.warning || "#FFB800"}
          />
        ))}
      </View>

      {review.comment ? (
        <Text style={styles.messageText}>{review.comment}</Text>
      ) : null}
    </Animated.View>
  );
};

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
  card: {
    backgroundColor: colors.background.card || "#FFFFFF",
    borderRadius: rounded.apple || 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.text.secondary,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: spacing.sm,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    color: colors.text.secondary,
  },
  emptyContainer: {
    marginTop: spacing.xl,
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
