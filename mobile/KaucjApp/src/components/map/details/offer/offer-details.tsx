import React from "react";
import { View, StyleSheet } from "react-native";
import { Offer } from "@/src/types";
import { formatDate } from "@/src/lib";
import DetailHeader from "../details-header";
import StatusBadge from "./status-badge";
import OfferItemsCard from "./offer-items-card";
import PickupCard from "./pickup-card";
import OfferSummaryCard from "./offer-summary-card";
import ReserveButton from "./reserve-button";

interface OfferDetailsProps {
  offer: Offer;
}

export default function OfferDetails({ offer }: OfferDetailsProps) {
  return (
    <View style={styles.container}>
      <DetailHeader
        title="Szczegóły oferty"
        subtitle={formatDate(offer.created_at)}
        rightSlot={<StatusBadge status={offer.status} />}
      />

      <OfferItemsCard offer={offer} />

      <PickupCard
        address={offer.pickup_address}
        instructions={offer.pickup_instructions}
      />

      <OfferSummaryCard offer={offer} />

      <ReserveButton offerId={offer.offer_id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
  },
});
