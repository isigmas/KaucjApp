import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import ReviewCard from "./review-list-card";
import { Review } from "@/src/types";
import { colors, rounded, shadows, spacing } from "@/src/theme";
import { useState } from "react";
import { layoutSpring } from "@/src/constants";
import ExpandableReview from "./expandable-review";

type ReviewType = "machine" | "user";

interface PreviewOrEditReviewBaseProps {
  type: ReviewType;
  existingReview: Review;
}

interface MachineReviewProps extends PreviewOrEditReviewBaseProps {
  type: "machine";
  machineId: number;
}

interface UserReviewProps extends PreviewOrEditReviewBaseProps {
  type: "user";
  userId: number;
  offerId: number;
}

type PreviewOrEditReviewProps = MachineReviewProps | UserReviewProps;

export default function PreviewOrEditReview(props: PreviewOrEditReviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(300).springify()}
        style={styles.sectionTitle}
      >
        Twoja opinia
      </Animated.Text>
      <Animated.View
        layout={layoutSpring}
        entering={FadeInDown.delay(300).springify()}
        style={styles.card}
      >
        {isEditing ? (
          props.type === "machine" ? (
            <ExpandableReview
              type="machine"
              machineId={props.machineId}
              isDefaultExpanded={true}
              existingReview={props.existingReview}
              style={styles.editReview}
              onEditCancel={() => setIsEditing(false)}
            />
          ) : (
            <ExpandableReview
              type="user"
              userId={props.userId}
              offerId={props.offerId}
              isDefaultExpanded={true}
              existingReview={props.existingReview}
              style={styles.editReview}
              onEditCancel={() => setIsEditing(false)}
            />
          )
        ) : (
          <ReviewCard
            index={-1}
            review={props.existingReview}
            key={props.existingReview.reviewId}
            asCard={false}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card || "#FFFFFF",
    borderRadius: rounded.apple,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    ...shadows.light,
  },
  container: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  editReview: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 0,
    paddingBottom: spacing.sm,
    paddingHorizontal: 0,
  },

  reviewCardContainer: {},
});
