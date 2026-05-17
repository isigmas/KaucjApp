import {
  useMyReservedOffers,
  useMyReservedOffersHistory,
} from "@/src/api/hooks/use-offer";
import QueryList, { QueryListCopy } from "@/src/components/ui/query-list";
import ActiveTabSelector, {
  SegmentedTab,
} from "@/src/components/ui/active-tab-selector";
import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import ReservedOfferCard from "./reserved-offer-card";

type ReservationsTab = "active" | "history";
const TABS: readonly SegmentedTab<ReservationsTab>[] = [
  { id: "active", label: "Aktywne" },
  { id: "history", label: "Historia" },
];

const keyExtractor = (offer: Offer) => offer.offerId.toString();
const renderItem = (offer: Offer) => <ReservedOfferCard offer={offer} />;

export default function ReservedOffersScreen() {
  const [activeTab, setActiveTab] = useState<ReservationsTab>("active");
  const activeReservations = useMyReservedOffers();
  const reservationsHistory = useMyReservedOffersHistory();

  const currentQuery =
    activeTab === "active" ? activeReservations : reservationsHistory;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={currentQuery.isRefetching}
          onRefresh={currentQuery.refetch}
          tintColor={colors.primary.base}
          colors={[colors.primary.base]}
          progressBackgroundColor={colors.background.main}
          progressViewOffset={10}
        />
      }
    >
      <View style={styles.switcherWrap}>
        <ActiveTabSelector
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          counts={{
            active: activeReservations.data?.length,
            history: reservationsHistory.data?.length,
          }}
        />
      </View>

      <QueryList
        key={activeTab}
        query={currentQuery}
        fallbackStates={fallbackStates[activeTab]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </ScrollView>
  );
}

const fallbackStates: Record<ReservationsTab, QueryListCopy> = {
  active: {
    loadingTitle: "Ładowanie twoich rezerwacji",
    errorTitle: "Ops! coś poszło nie tak podczas ładowania twoich rezerwacji",
    errorMessage: "Nie udało się pobrać rezerwacji.",
    emptyTitle: "Obecnie nie rezerwujesz żadnych ofert.",
  },
  history: {
    loadingTitle: "Ładowanie historii rezerwacji",
    errorTitle: "Ops! coś poszło nie tak podczas ładowania historii",
    errorMessage: "Nie udało się pobrać historii rezerwacji.",
    emptyTitle:
      "Twoja historia rezerwacji jest pusta. Zakończone rezerwacje pojawią się tutaj.",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
    flexGrow: 1,
  },
  switcherWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.main,
  },
});
