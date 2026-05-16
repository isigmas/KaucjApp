import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, rounded, spacing } from "@/src/theme";

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  createdAt: string;
}

const useUserReviews = (userId: number) => {
  return {
    data: [
      {
        id: "1",
        reviewerName: "Aśka Kurwisko",
        rating: 2,
        message: "Kurier to chuj",
        createdAt: "2 dni temu",
      },
      {
        id: "2",
        reviewerName: "Michał Cwel",
        rating: 4,
        message:
          "Wszystko w porządku, punktualnie i bez problemów. Szybka wymiana.",
        createdAt: "1 tydzień temu",
      },
      {
        id: "3",
        reviewerName: "Aśka Kurwisko",
        rating: 2,
        message: "Kurier to chuj",
        createdAt: "2 dni temu",
      },
      {
        id: "4",
        reviewerName: "Michał Cwel",
        rating: 4,
        message:
          "Wszystko w porządku, punktualnie i bez problemów. Szybka wymiana.",
        createdAt: "1 tydzień temu",
      },
      {
        id: "5",
        reviewerName: "Aśka Kurwisko",
        rating: 2,
        message: "Kurier to chuj",
        createdAt: "2 dni temu",
      },
      {
        id: "6",
        reviewerName: "Michał Cwel",
        rating: 4,
        message:
          "Wszystko w porządku, punktualnie i bez problemów. Szybka wymiana.",
        createdAt: "1 tydzień temu",
      },
      {
        id: "7",
        reviewerName: "Aśka Kurwisko",
        rating: 2,
        message: "Kurier to chuj",
        createdAt: "2 dni temu",
      },
      {
        id: "8",
        reviewerName: "Michał Cwel",
        rating: 4,
        message:
          "Wszystko w porządku, punktualnie i bez problemów. Szybka wymiana.",
        createdAt: "1 tydzień temu",
      },
    ] as Review[],
    isLoading: false,
  };
};

interface ReviewsSectionProps {
  userId: number;
}

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(400 + index * 100).springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.reviewerName} numberOfLines={1}>
          {review.reviewerName}
        </Text>
        <Text style={styles.dateText}>{review.createdAt}</Text>
      </View>

      <View style={styles.starsRow}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < review.rating ? "star" : "star-outline"}
            size={14}
            color={colors.status?.warning || "#FFB800"}
          />
        ))}
      </View>

      {review.message ? (
        <Text style={styles.messageText}>{review.message}</Text>
      ) : null}
    </Animated.View>
  );
};

export default function ReviewsSection({ userId }: ReviewsSectionProps) {
  const { data: reviews, isLoading } = useUserReviews(userId);

  if (isLoading) {
    return null;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyText}>Brak opinii dla tego użytkownika.</Text>
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
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
      </View>
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
  card: {
    backgroundColor: colors.background.card || "#FFFFFF",
    borderRadius: rounded.apple || 16,
    padding: spacing.md,
    // Soft Apple-like elevation shadow
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
