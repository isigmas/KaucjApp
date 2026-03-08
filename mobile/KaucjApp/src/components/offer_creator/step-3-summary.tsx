import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import { colors } from "@/src/theme";
import { OfferData } from "./create-offer";
import AnimatedRollingNumber from "react-native-animated-rolling-numbers";
import { useCreateOffer } from "@/src/api/useOffer";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useRouter } from "expo-router";
import { useLocationStore } from "@/src/state/location";

interface Step3SummaryProps {
  data: OfferData;
  updateData: (newData: Partial<OfferData>) => void;
}

export default function Step3Summary({ data, updateData }: Step3SummaryProps) {
  const { mutate: createOffer, isPending } = useCreateOffer();
  const { clearLocation } = useLocationStore();
  const router = useRouter();

  const handleSubmit = () => {
    console.log("Button pressed");
    createOffer(data, {
      onSuccess: (responseData) => {
        console.log("200: ", responseData);

        updateData({
          plasticBottles: 10,
          glassBottles: 0,
          cans: 0,
          latitude: null,
          longitude: null,
          plasticPrice: 0.2,
          glassPrice: 0.5,
          cansPrice: 0.2,
          address: "",
          notes: "",
        });

        clearLocation();

        router.replace("/(tabs)/create/success-screen");
      },
      onError: (error) => {
        console.error("Error: ", error);
      },
    });
  };

  const totalDepositValue =
    data.plasticBottles * 0.5 + data.glassBottles * 1 + data.cans * 0.5;

  const totalValue =
    data.plasticBottles * data.plasticPrice +
    data.glassBottles * data.glassPrice +
    data.cans * data.cansPrice;

  const courierProfit = totalDepositValue - totalValue;

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

      {/*  Quantity and Price */}
      <Animated.View
        entering={FadeInUp.delay(100).springify().damping(40)}
        style={styles.summaryCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>♻️</Text>
          <Text style={styles.cardHeaderTitle}>Co trafia do recyklingu</Text>
        </View>

        <View style={styles.cardContent}>
          {data.plasticBottles > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>
                Butelki plastikowe ({data.plasticBottles} szt.)
              </Text>
              <Text style={styles.lineItemValue}>
                {data.plasticPrice.toFixed(2)} zł/szt.
              </Text>
            </View>
          )}

          {data.glassBottles > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>
                Butelki szklane ({data.glassBottles} szt.)
              </Text>
              <Text style={styles.lineItemValue}>
                {data.glassPrice.toFixed(2)} zł/szt.
              </Text>
            </View>
          )}

          {data.cans > 0 && (
            <View style={styles.lineItem}>
              <Text style={styles.lineItemLabel}>
                Metalowe puszki ({data.cans} szt.)
              </Text>
              <Text style={styles.lineItemValue}>
                {data.cansPrice.toFixed(2)} zł/szt.
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Łączna wartość kaucji:</Text>
            <Text style={styles.totalValue}>
              {totalDepositValue.toFixed(2)} zł
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={{ gap: 4 }}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelSmall}>Zysk kuriera:</Text>
              <Text style={styles.totalValueSmall}>
                {courierProfit.toFixed(2)} zł
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelHighlight}>Ty otrzymasz:</Text>
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

      {/* Location and Notes  */}
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
              {data.address ? data.address : "Nie podano dokładnego adresu"}
            </Text>
          </View>
          {data.latitude && data.longitude && (
            <View
              style={{
                height: 100,
                marginTop: 8,
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.mapThumbnail}
                region={{
                  latitude: data.latitude,
                  longitude: data.longitude,
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
                    latitude: data.latitude!,
                    longitude: data.longitude!,
                  }}
                  pinColor={colors.primary.base}
                />
              </MapView>
            </View>
          )}

          {data.notes ? (
            <View style={[styles.lineItemColumn, { marginTop: 16 }]}>
              <Text style={styles.lineItemLabel}>Wiadomość dla kuriera:</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{data.notes}</Text>
              </View>
            </View>
          ) : null}

          {!data.latitude && (
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
        style={[styles.buttonPrimary, isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Opublikuj</Text>
        )}
      </Pressable>
    </ScrollView>
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
  mapThumbnail: {
    ...StyleSheet.absoluteFillObject,
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
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.primary.light,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  buttonTextSecondary: { color: "#111827", fontWeight: "700", fontSize: 16 },
});
