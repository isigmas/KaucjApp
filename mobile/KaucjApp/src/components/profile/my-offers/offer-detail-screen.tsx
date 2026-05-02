import { useMyOffers } from "@/src/api/hooks/use-offer";
import OfferItemsCard from "@/src/components/map/details/offer/offer-items-card";
import { OfferSummaryCard } from "@/src/components/map/details/offer/offer-summary-card";
import PickupCard from "@/src/components/map/details/offer/pickup-card";
import SectionCard from "@/src/components/map/details/section-card";
import MiniMap from "@/src/components/profile/reserved-offers/mini-map";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { formatDate, getOfferStatusConfig } from "@/src/lib";
import { colors, rounded, spacing } from "@/src/theme";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Countdown from "../reserved-offers/countdown";
import CourierCard from "./courier-card";
import OfferActions from "./offer-actions";

interface OfferDetailScreenProps {
  offerId: number;
}

export default function OfferDetailScreen({ offerId }: OfferDetailScreenProps) {
  const { data: offers, isLoading, isError, error, refetch } = useMyOffers();

  if (isLoading) {
    return <LoadingState title="Ładowanie oferty" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Nie udało się załadować oferty"
        message={error?.response?.data?.message || "Spróbuj ponownie."}
        onRetry={refetch}
      />
    );
  }

  const offer = offers?.find((o) => o.offer_id === offerId);

  if (!offer) {
    return (
      <EmptyState title="Ta oferta jest już niedostępna." onRefresh={refetch} />
    );
  }

  const { color, label } = getOfferStatusConfig(offer.status);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <OfferStatusCard
        status={label}
        statusColor={color}
        createdAt={offer.created_at}
        reservedAt={offer.reserved_at}
        reservedTo={offer.reserved_to}
      />

      {offer.status === "RESERVED" && <CourierCard />}
      <OfferSummaryCard offer={offer} isInMyOffers />

      <OfferItemsCard offer={offer} />

      <PickupCard
        address={offer.pickup_address}
        instructions={offer.pickup_instructions}
      />

      <MiniMap
        interactive
        latitude={offer.latitude}
        longitude={offer.longitude}
        height={180}
        style={styles.map}
      />

      <OfferActions offer={offer} />
    </ScrollView>
  );
}

interface OfferStatusCardProps {
  status: string;
  statusColor: string;
  createdAt: string;
  reservedAt: string | null;
  reservedTo: string | null;
}

function OfferStatusCard({
  status,
  statusColor,
  createdAt,
  reservedAt,
  reservedTo,
}: OfferStatusCardProps) {
  return (
    <SectionCard style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View
          style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.datesGrid}>
        <DateItem
          icon={<Clock size={14} color={colors.text.muted} />}
          label="Utworzono"
          value={formatDate(createdAt)}
        />
        {reservedAt && (
          <DateItem
            icon={<Calendar size={14} color={colors.accent.base} />}
            label="Zarezerwowano"
            value={formatDate(reservedAt)}
          />
        )}
      </View>
      {reservedTo && (
        <Countdown expiresAt={reservedTo} variant="block" showBorder={false} />
      )}
    </SectionCard>
  );
}

interface DateItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DateItem({ icon, label, value }: DateItemProps) {
  return (
    <View style={styles.dateItem}>
      <View style={styles.dateItemHeader}>
        {icon}
        <Text style={styles.dateItemLabel}>{label}</Text>
      </View>
      <Text style={styles.dateItemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  map: {
    marginBottom: spacing.lg,
  },
  statusCard: {
    gap: spacing.sm,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: rounded.pill,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  datesGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateItem: {
    flex: 1,
    gap: 3,
  },
  dateItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateItemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateItemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
});
