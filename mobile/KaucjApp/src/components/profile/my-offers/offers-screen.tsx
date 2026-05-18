import { useMyOffers, useMyOffersHistory } from "@/src/api/hooks/use-offer";
import QueryList, { QueryListCopy } from "@/src/components/ui/query-list";
import ActiveTabSelector, {
  SegmentedTab,
} from "@/src/components/ui/active-tab-selector";
import { colors, spacing } from "@/src/theme";
import { Offer } from "@/src/types";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import MyOfferCard from "./my-offer-card";

type OffersTab = "active" | "history";

const TABS: readonly SegmentedTab<OffersTab>[] = [
  { id: "active", label: "Aktywne" },
  { id: "history", label: "Historia" },
];

const keyExtractor = (offer: Offer) => offer.offerId.toString();
const renderItem = (offer: Offer) => <MyOfferCard offer={offer} />;

export default function MyOffersScreen() {
  const [activeTab, setActiveTab] = useState<OffersTab>("active");
  const activeOffers = useMyOffers();
  const offersHistory = useMyOffersHistory();

  const currentQuery = activeTab === "active" ? activeOffers : offersHistory;

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
            active: activeOffers.data?.length,
            history: offersHistory.data?.length,
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

const fallbackStates: Record<OffersTab, QueryListCopy> = {
  active: {
    loadingTitle: "Ładowanie twoich ofert",
    errorTitle: "Ops! coś poszło nie tak podczas ładowania twoich ofert",
    errorMessage: "Nie udało się pobrać ofert.",
    emptyTitle: "Aktualnie nie masz żadnych aktywnych ofert.",
  },
  history: {
    loadingTitle: "Ładowanie historii ofert",
    errorTitle: "Ops! coś poszło nie tak podczas ładowania historii",
    errorMessage: "Nie udało się pobrać historii ofert.",
    emptyTitle:
      "Twoja historia ofert jest pusta. Zakończone oferty pojawią się tutaj.",
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
