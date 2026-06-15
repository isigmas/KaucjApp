import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Info } from "lucide-react-native";
import { Image } from "expo-image";

import { colors, rounded, shadows, spacing } from "@/src/theme";
import ExpandableCard from "../ui/expandable-card";
import {
  FAQ_DATA,
  layoutSpring,
  type FaqItem as FaqItemType,
} from "@/src/constants";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function FaqScreen() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      {FAQ_DATA.map((section, sectionIndex) => (
        <View key={section.category} style={styles.section}>
          <Animated.View layout={layoutSpring}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
          </Animated.View>

          <Animated.View
            layout={layoutSpring}
            entering={FadeInUp.delay((sectionIndex + 1) * 100)}
            style={styles.sectionContent}
          >
            {section.items.map((item, itemIndex) => (
              <React.Fragment key={item.question}>
                <FaqItem item={item} index={itemIndex} />
                {itemIndex !== section.items.length - 1 && (
                  <Animated.View layout={layoutSpring} style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </Animated.View>
        </View>
      ))}
    </ScrollView>
  );
}

const FaqItem = ({ item, index }: { item: FaqItemType; index: number }) => {
  return (
    <ExpandableCard
      title={item.question}
      titleStyle={styles.title}
      style={styles.card}
      defaultExpanded={item.question === "Jaka jest misja KaucjApp?"}
    >
      <View>
        <Text style={styles.answerText}>{item.answer}</Text>

        {/* Optional Bulleted List */}
        {"list" in item && item.list && (
          <View style={styles.listContainer}>
            {item.list.map((listItem, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listText}>{listItem}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Optional Emphasized Note */}
        {"note" in item && item.note && (
          <View style={styles.noteContainer}>
            <Info size={18} color={colors.primary.base || "#007AFF"} />
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        )}

        {"image" in item && item.image && (
          <View style={styles.imageContainer}>
            <Image
              source={
                item.image === "deposit-mark"
                  ? require("@/assets/images/deposit-mark.png")
                  : undefined
              }
              style={styles.faqImage}
              contentFit="contain"
              transition={400}
              alt="Oznaczenie butelki kaucyjnej"
            />
          </View>
        )}
      </View>
    </ExpandableCard>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    padding: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl || 64,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    letterSpacing: 0.1,
  },

  screenSubtitle: {
    fontSize: 16,
    color: colors.text.muted,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    letterSpacing: -0.3,
  },
  sectionContent: {
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.status.border,
    backgroundColor: colors.background.card,
    ...shadows.light,
  },
  card: {
    borderRadius: 0,
    borderWidth: 0,
    margin: 0,
    marginBottom: 0,
    backgroundColor: "transparent",
    padding: spacing.sm,
  },
  divider: {
    height: 0.8,
    backgroundColor: colors.status.border,
  },

  answerText: {
    fontSize: 15,
    color: colors.text.secondary || "#3C3C43",
    lineHeight: 22,
  },
  listContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.muted,
    marginTop: 8,
    marginRight: spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.secondary || "#3C3C43",
    lineHeight: 22,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.light || "#E5F0FF",
    padding: spacing.md,
    borderRadius: rounded.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.dark || "#004080",
    lineHeight: 20,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: colors.background.subtle,
    borderRadius: rounded.lg,
    marginTop: spacing.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  faqImage: {
    width: "100%",
    height: "100%",
    padding: spacing.sm,
  },
});
