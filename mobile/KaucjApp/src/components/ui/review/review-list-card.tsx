import { layoutSpring } from "@/src/constants";
import { timeAgoInPolish } from "@/src/lib";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { Review } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { PencilIcon } from "lucide-react-native";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ReviewCardProps {
  review: Review;
  index?: number;
  onEdit?: () => void;
  asCard?: boolean;
}

export default function ReviewCard({
  review,
  index = 1,
  asCard = true,
  onEdit,
}: ReviewCardProps) {
  return (
    <Animated.View
      layout={layoutSpring}
      entering={FadeInDown.delay(Math.min((index + 2) * 80, 400)).springify()}
      style={asCard ? styles.card : {}}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.reviewerName} numberOfLines={1}>
          {review.reviewerUsername}
        </Text>
        <Text style={styles.dateText}>{timeAgoInPolish(review.createdAt)}</Text>
        {onEdit ? (
          <Pressable onPress={onEdit}>
            <PencilIcon
              size={20}
              color={colors.text.primary}
              style={styles.editIcon}
            />
          </Pressable>
        ) : null}
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
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card || "#FFFFFF",
    borderRadius: rounded.apple || 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.light,
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

  editIcon: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
