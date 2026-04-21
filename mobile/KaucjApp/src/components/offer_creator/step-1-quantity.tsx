import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import Animated, { Layout, FadeIn, FadeOut } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { colors } from "@/src/theme";
import { OfferData } from "./create-offer";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { Easing } from "react-native-reanimated";

interface Step1QuantityProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

type ContainerType = "plastic" | "glass" | "cans";

interface RowConfig {
  id: ContainerType;
  title: string;
  icon: string;
  quantityKey: keyof OfferData;
  priceKey: keyof OfferData;
  maxPrice: number;
}

const CONTAINER_TYPES: RowConfig[] = [
  {
    id: "plastic",
    title: "Butelki plastikowe",
    icon: "🥤",
    quantityKey: "plasticBottles",
    priceKey: "plasticPrice",
    maxPrice: 0.5,
  },
  {
    id: "cans",
    title: "Puszki",
    icon: "🥫",
    quantityKey: "cans",
    priceKey: "cansPrice",
    maxPrice: 0.5,
  },
];

export default function Step1Quantity({
  data,
  updateData,
}: Step1QuantityProps) {
  const [expandedRow, setExpandedRow] = useState<ContainerType | null>(
    "plastic",
  );

  const toggleRow = (id: ContainerType) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const totalDepositValue =
    data.plasticBottles * 0.5 + data.glassBottles * 1 + data.cans * 0.5;

  const totalValue =
    data.plasticBottles * data.plasticPrice +
    data.glassBottles * data.glassPrice +
    data.cans * data.cansPrice;

  const totalSellValue = totalDepositValue - totalValue;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.rowsContainer}>
        {CONTAINER_TYPES.map((item) => {
          const isExpanded = expandedRow === item.id;
          const quantity = data[item.quantityKey] as number;
          const price = data[item.priceKey] as number;
          const subtotal = (quantity * price).toFixed(2);

          return (
            <Animated.View
              key={item.id}
              layout={Layout.springify().damping(50).stiffness(500).mass(2.5)}
              style={[styles.rowCard, isExpanded && styles.rowCardExpanded]}
            >
              {/* Header */}
              <Pressable
                style={styles.rowHeader}
                onPress={() => toggleRow(item.id)}
              >
                <View style={styles.rowHeaderLeft}>
                  <Text style={styles.rowIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    {quantity > 0 && !isExpanded && (
                      <Text style={styles.rowSummaryText}>
                        {quantity} szt. • {price.toFixed(2)} zł/szt.
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.rowHeaderRight}>
                  {quantity > 0 ? (
                    <Text style={styles.subtotalText}>{subtotal} zł</Text>
                  ) : (
                    <Text style={styles.chevronText}>
                      {isExpanded ? "−" : "+"}
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* Expanded Content */}
              {isExpanded && (
                <Animated.View
                  entering={FadeIn.delay(100)}
                  exiting={FadeOut}
                  style={styles.expandedContent}
                >
                  <View style={styles.divider} />

                  <View style={styles.inputGroup1}>
                    <Text style={styles.inputLabel}>Ilość (szt.)</Text>
                    <View style={styles.stepperContainer}>
                      <Pressable
                        style={styles.stepperButton}
                        onPress={() =>
                          updateData({
                            [item.quantityKey]: Math.max(0, quantity - 1),
                          })
                        }
                      >
                        <Text style={styles.stepperButtonText}>−</Text>
                      </Pressable>

                      <TextInput
                        style={styles.quantityInput}
                        keyboardType="numeric"
                        returnKeyType="done"
                        value={quantity.toString()}
                        onChangeText={(val) => {
                          const num = parseInt(val) || 0;
                          updateData({ [item.quantityKey]: num });
                        }}
                      />

                      <Pressable
                        style={styles.stepperButton}
                        onPress={() =>
                          updateData({ [item.quantityKey]: quantity + 1 })
                        }
                      >
                        <Text style={styles.stepperButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/*  Slider */}
                  <View style={styles.inputGroup}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.inputLabel}>
                        Twoja cena za sztukę
                      </Text>
                      <Text style={styles.priceHighlight}>
                        {price.toFixed(2)} zł
                      </Text>
                    </View>

                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={item.maxPrice}
                      step={0.01}
                      value={price}
                      onValueChange={(val) =>
                        updateData({ [item.priceKey]: val })
                      }
                      minimumTrackTintColor={colors.primary.base}
                      maximumTrackTintColor={colors.status.border}
                      thumbTintColor={colors.primary.dark}
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabelText}>Oddaj za darmo</Text>
                      <Text style={styles.sliderLabelText}>
                        Max kaucja ({item.maxPrice.toFixed(2)} zł)
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* Total Summary */}
      {totalValue > 0 && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout.springify()}
          style={styles.totalContainer}
        >
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Łączna wartość kaucji:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AnimatedRollingNumber
                value={totalDepositValue}
                toFixed={2}
                useGrouping={true}
                textStyle={styles.totalAmount}
                spinningAnimationConfig={{
                  duration: 500,
                  easing: Easing.bounce,
                }}
              />
              <Text style={styles.totalAmount}>zł</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Twoja cena:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AnimatedRollingNumber
                value={totalValue}
                toFixed={2}
                useGrouping={true}
                textStyle={styles.totalAmount}
                spinningAnimationConfig={{
                  duration: 500,
                  easing: Easing.bounce,
                }}
              />
              <Text style={styles.totalAmount}>zł</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Zysk kuriera:</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AnimatedRollingNumber
                value={totalSellValue}
                toFixed={2}
                useGrouping={true}
                textStyle={styles.totalAmount}
                spinningAnimationConfig={{
                  duration: 500,
                  easing: Easing.bounce,
                }}
              />
              <Text style={styles.totalAmount}>zł</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  rowsContainer: {
    gap: 12,
  },
  rowCard: {
    backgroundColor: colors.background.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.status.border,
    overflow: "hidden",
  },
  rowCardExpanded: {
    borderColor: colors.primary.base,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  rowHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    fontSize: 24,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  rowSummaryText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rowHeaderRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  chevronText: {
    fontSize: 24,
    color: colors.text.muted,
    fontWeight: "300",
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.subtle,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroup1: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.subtle,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  stepperButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperButtonText: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: "500",
  },
  quantityInput: {
    width: 60,
    height: 44,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    backgroundColor: colors.background.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.status.border,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.base,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  totalContainer: {
    flexDirection: "column",
    gap: 8,
    marginTop: 24,
    padding: 16,
    paddingVertical: 20,
    backgroundColor: colors.primary.light,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.primary.base,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary.dark,
  },
  totalAmountAnimated: {
    paddingBottom: -5,
    fontSize: 20,
    fontWeight: "600",
    color: colors.primary.dark,
  },
});
