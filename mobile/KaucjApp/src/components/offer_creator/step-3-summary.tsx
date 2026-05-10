import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import AnimatedRollingNumber from "react-native-animated-rolling-numbers";
import { useFormContext, useWatch } from "react-hook-form";
import { colors } from "@/src/theme";
import { computeOfferTotals, type OfferFormValues } from "./offer-form-schema";

interface Step3SummaryProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function Step3Summary({
  onSubmit,
  isSubmitting,
}: Step3SummaryProps) {
  const { control } = useFormContext<OfferFormValues>();
  const values = useWatch({ control }) as OfferFormValues;
  const totals = computeOfferTotals(values);

  const hasLocation = values.latitude !== null && values.longitude !== null;

  return (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Podsumowanie</Text>
        <Text style={styles.headerSubtitle}>
          Sprawdź szczegóły swojej oferty.
        </Text>
      </View>

      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(40)}
        style={styles.summaryCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>♻️</Text>
          <Text style={styles.cardHeaderTitle}>Co trafia do recyklingu</Text>
        </View>

        <View style={styles.cardContent}>
          {values.plasticBottles > 0 && (
            <LineItem
              label={`Butelki plastikowe (${values.plasticBottles} szt.)`}
              value={`${values.plasticPrice.toFixed(2)} zł/szt.`}
            />
          )}

          {values.cans > 0 && (
            <LineItem
              label={`Metalowe puszki (${values.cans} szt.)`}
              value={`${values.cansPrice.toFixed(2)} zł/szt.`}
            />
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Łączna wartość kaucji:</Text>
            <Text style={styles.totalValue}>
              {totals.totalDepositValue.toFixed(2)} zł
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelSmall}>Zysk kuriera:</Text>
              <Text style={styles.totalValueSmall}>
                {totals.courierProfit.toFixed(2)} zł
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelHighlight}>Ty otrzymasz:</Text>
              <View style={styles.highlightValueWrapper}>
                <AnimatedRollingNumber
                  value={totals.userPrice}
                  toFixed={2}
                  useGrouping
                  textStyle={styles.totalValueHighlight}
                  spinningAnimationConfig={{
                    duration: 1500,
                    easing: Easing.out(Easing.cubic),
                  }}
                />
                <Text style={styles.totalValueHighlight}>zł</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(200).springify().damping(40)}
        style={styles.summaryCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>📍</Text>
          <Text style={styles.cardHeaderTitle}>Miejsce odboiru</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.lineItemColumn}>
            <Text style={styles.lineItemLabel}>Adres:</Text>
            <Text style={styles.lineItemValueText}>
              {values.pickupAddress
                ? values.pickupAddress
                : "Nie podano dokładnego adresu"}
            </Text>
          </View>

          {hasLocation && (
            <View style={styles.miniMapContainer}>
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.miniMap}
                region={{
                  latitude: values.latitude as number,
                  longitude: values.longitude as number,
                  latitudeDelta: 0.0007,
                  longitudeDelta: 0.0007,
                }}
                pitchEnabled={false}
                rotateEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: values.latitude as number,
                    longitude: values.longitude as number,
                  }}
                  pinColor={colors.primary.base}
                />
              </MapView>
            </View>
          )}

          {values.pickupInstructions ? (
            <View style={[styles.lineItemColumn, styles.notesBlock]}>
              <Text style={styles.lineItemLabel}>Wiadomość dla kuriera:</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{values.pickupInstructions}</Text>
              </View>
            </View>
          ) : null}

          {!hasLocation && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Pamiętaj, że nie przypiąłeś dokładnej pinezki na mapie. Może
                to utrudnić kurierowi odnalezienie Twojego adresu.
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Pressable
        style={[styles.buttonPrimary, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.text.white} />
        ) : (
          <Text style={styles.buttonText}>Opublikuj</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

interface LineItemProps {
  label: string;
  value: string;
}

function LineItem({ label, value }: LineItemProps) {
  return (
    <View style={styles.lineItem}>
      <Text style={styles.lineItemLabel}>{label}</Text>
      <Text style={styles.lineItemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.status.border,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  cardHeaderIcon: {
    fontSize: 18,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lineItemColumn: {
    flexDirection: "column",
    gap: 4,
  },
  lineItemLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  lineItemValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  lineItemValueText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    marginVertical: 12,
  },
  totalsBlock: {
    gap: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  totalLabelHighlight: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  totalValueHighlight: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  totalLabelSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent.dark,
  },
  totalValueSmall: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.accent.dark,
  },
  highlightValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniMapContainer: {
    height: 100,
    marginTop: 8,
    borderRadius: 24,
    overflow: "hidden",
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  notesBlock: {
    marginTop: 16,
  },
  notesBox: {
    backgroundColor: colors.background.subtle,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  notesText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    fontStyle: "italic",
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: colors.primary.base,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.primary.light,
  },
  buttonText: {
    color: colors.text.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
