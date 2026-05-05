import { useMyOffers } from "@/src/api/hooks/use-offer";
import OfferItemsCard from "@/src/components/map/details/offer/offer-items-card";
import { OfferSummaryCard } from "@/src/components/map/details/offer/offer-summary-card";
import PickupCard from "@/src/components/map/details/offer/pickup-card";
import MiniMap from "@/src/components/profile/reserved-offers/mini-map";
import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import { MapPin, Package, Receipt } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ExpandableCard from "./expandable-card";
import OfferActions from "./offer-actions";
import OfferStatusSummaryCard from "./offer-status-summary-card";

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

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <OfferStatusSummaryCard offer={offer} />

      <OfferDetailsAccordion offer={offer} />

      <OfferActions offer={offer} />
    </ScrollView>
  );
}

function OfferDetailsAccordion({ offer }: { offer: Offer }) {
  return (
    <>
      <ExpandableCard
        title="Zawartość"
        subtitle={`${offer.total_quantity} szt. · butelki i puszki`}
        icon={<Package size={18} color={colors.primary.dark} />}
      >
        <OfferItemsCard offer={offer} bare />
      </ExpandableCard>

      <ExpandableCard
        title="Finanse"
        subtitle={`Należność ${offer.total_prize.toFixed(2).replace(".", ",")} zł`}
        icon={<Receipt size={18} color={colors.primary.dark} />}
      >
        <OfferSummaryCard offer={offer} bare />
      </ExpandableCard>

      <ExpandableCard
        title="Lokalizacja"
        subtitle={offer.pickup_address}
        icon={<MapPin size={18} color={colors.accent.dark} />}
      >
        <View style={styles.pickupBody}>
          <PickupCard
            address={offer.pickup_address}
            instructions={offer.pickup_instructions}
            bare
          />
          <MiniMap
            interactive
            latitude={offer.latitude}
            longitude={offer.longitude}
            height={180}
          />
        </View>
      </ExpandableCard>
    </>
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
  pickupBody: {
    gap: spacing.md,
  },
});
