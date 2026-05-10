import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { AnimatedRollingNumber } from "react-native-animated-rolling-numbers";
import { colors } from "@/src/theme";
import {
  computeOfferTotals,
  PRICE_MAX,
  type OfferFormValues,
} from "./offer-form-schema";

type ItemKey = "plastic" | "cans";

interface RowConfig {
  id: ItemKey;
  title: string;
  icon: string;
  quantityField: "plasticBottles" | "cans";
  priceField: "plasticPrice" | "cansPrice";
}

const ROWS: readonly RowConfig[] = [
  {
    id: "plastic",
    title: "Butelki plastikowe",
    icon: "🥤",
    quantityField: "plasticBottles",
    priceField: "plasticPrice",
  },
  {
    id: "cans",
    title: "Puszki",
    icon: "🥫",
    quantityField: "cans",
    priceField: "cansPrice",
  },
];

export default function Step1Quantity() {
  const { control } = useFormContext<OfferFormValues>();
  const [expandedRow, setExpandedRow] = useState<ItemKey | null>("plastic");

  const values = useWatch({ control });
  const totals = computeOfferTotals({
    ...values,
    plasticBottles: values.plasticBottles ?? 0,
    cans: values.cans ?? 0,
    plasticPrice: values.plasticPrice ?? 0,
    cansPrice: values.cansPrice ?? 0,
  } as OfferFormValues);

  const showTotals = totals.userPrice > 0;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.rowsContainer}>
        {ROWS.map((row) => (
          <ItemRow
            key={row.id}
            row={row}
            isExpanded={expandedRow === row.id}
            onToggle={() =>
              setExpandedRow((prev) => (prev === row.id ? null : row.id))
            }
          />
        ))}
      </View>

      {showTotals && <TotalsCard totals={totals} />}
    </View>
  );
}

interface ItemRowProps {
  row: RowConfig;
  isExpanded: boolean;
  onToggle: () => void;
}

function ItemRow({ row, isExpanded, onToggle }: ItemRowProps) {
  const { control } = useFormContext<OfferFormValues>();
  const quantity = useWatch({ control, name: row.quantityField }) ?? 0;
  const price = useWatch({ control, name: row.priceField }) ?? 0;
  const subtotal = (quantity * price).toFixed(2);

  return (
    <Animated.View
      layout={Layout.springify().damping(50).stiffness(500).mass(2.5)}
      style={[styles.rowCard, isExpanded && styles.rowCardExpanded]}
    >
      <Pressable style={styles.rowHeader} onPress={onToggle}>
        <View style={styles.rowHeaderLeft}>
          <Text style={styles.rowIcon}>{row.icon}</Text>
          <View>
            <Text style={styles.rowTitle}>{row.title}</Text>
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
            <Text style={styles.chevronText}>{isExpanded ? "−" : "+"}</Text>
          )}
        </View>
      </Pressable>

      {isExpanded && (
        <Animated.View
          entering={FadeIn.delay(100)}
          exiting={FadeOut}
          style={styles.expandedContent}
        >
          <View style={styles.divider} />

          <Controller
            control={control}
            name={row.quantityField}
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputGroup1}>
                <Text style={styles.inputLabel}>Ilość (szt.)</Text>
                <View style={styles.stepperContainer}>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => onChange(Math.max(0, (value ?? 0) - 1))}
                  >
                    <Text style={styles.stepperButtonText}>−</Text>
                  </Pressable>

                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={String(value ?? 0)}
                    onChangeText={(raw) => {
                      const next = parseInt(raw, 10);
                      onChange(Number.isFinite(next) ? next : 0);
                    }}
                  />

                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => onChange((value ?? 0) + 1)}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name={row.priceField}
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputGroup}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.inputLabel}>Twoja cena za sztukę</Text>
                  <Text style={styles.priceHighlight}>
                    {(value ?? 0).toFixed(2)} zł
                  </Text>
                </View>

                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={PRICE_MAX}
                  step={0.01}
                  value={value ?? 0}
                  onValueChange={onChange}
                  minimumTrackTintColor={colors.primary.base}
                  maximumTrackTintColor={colors.status.border}
                  thumbTintColor={colors.primary.dark}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>Oddaj za darmo</Text>
                  <Text style={styles.sliderLabelText}>
                    Max kaucja ({PRICE_MAX.toFixed(2)} zł)
                  </Text>
                </View>
              </View>
            )}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface TotalsCardProps {
  totals: ReturnType<typeof computeOfferTotals>;
}

function TotalsCard({ totals }: TotalsCardProps) {
  const rows: readonly { label: string; value: number }[] = [
    { label: "Łączna wartość kaucji:", value: totals.totalDepositValue },
    { label: "Twoja cena:", value: totals.userPrice },
    { label: "Zysk kuriera:", value: totals.courierProfit },
  ];

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={styles.totalContainer}
    >
      {rows.map((row) => (
        <View key={row.label} style={styles.totalRow}>
          <Text style={styles.totalLabel}>{row.label}</Text>
          <View style={styles.totalValueWrapper}>
            <AnimatedRollingNumber
              value={row.value}
              toFixed={2}
              useGrouping
              textStyle={styles.totalAmount}
              spinningAnimationConfig={{
                duration: 500,
                easing: Easing.bounce,
              }}
            />
            <Text style={styles.totalAmount}>zł</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: colors.background.main,
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
  totalValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary.dark,
  },
});
