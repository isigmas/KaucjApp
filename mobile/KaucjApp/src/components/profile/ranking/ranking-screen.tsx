import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useInfiniteRanking } from "@/src/api/hooks/use-ranking";
import { RankingActivityType, UserStats } from "@/src/types/ranking";
import { colors, spacing } from "@/src/theme";
import Podium from "./podium";
import RankingListItem from "./ranking-list-item";
import LoadingState from "@/src/components/states/loading-state";
import ErrorState from "@/src/components/states/error-state";
import { SafeAreaView } from "react-native-safe-area-context";
import ActiveTabSelector from "../../ui/active-tab-selector";

const TABS = [
  { id: "returned_total", label: "Wystawiający" },
  { id: "collected_total", label: "Odbierający" },
] as const;

export default function RankingScreen() {
  const [activityType, setActivityType] =
    useState<RankingActivityType>("returned_total");

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRanking({ type: activityType });

  // Flatten infinite query pages into a single array
  const allUsers = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  const top3 = allUsers.slice(0, 3);
  const remainingUsers = allUsers.slice(3);

  if (isLoading && allUsers.length === 0) {
    return <LoadingState title="Wczytywanie rankingu..." />;
  }

  if (isError && allUsers.length === 0) {
    return (
      <ErrorState
        title="Nie udało się pobrać rankingu"
        message="Spróbuj ponownie później."
        onRetry={refetch}
      />
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ActiveTabSelector
        tabs={TABS}
        active={activityType}
        onChange={setActivityType}
      />

      {top3.length > 0 && <Podium topUsers={top3} type={activityType} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={top3}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item: UserStats) => item.userId.toString()}
        renderItem={({ item, index }) => (
          <RankingListItem user={item} rank={index + 4} type={activityType} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.loader}
              color={colors.primary.base}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>Brak danych w rankingu.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  loader: {
    marginVertical: spacing.md,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: spacing.xl,
    fontSize: 16,
  },
});
