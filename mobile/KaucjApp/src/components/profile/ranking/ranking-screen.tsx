import React, { useState, useMemo, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useInfiniteRanking } from "@/src/api/hooks/use-ranking";
import { RankingActivityType, UserStats } from "@/src/types/ranking";
import { colors, rounded, spacing } from "@/src/theme";
import Podium from "./podium";
import RankingListItem from "./ranking-list-item";
import LoadingState from "@/src/components/states/loading-state";
import ErrorState from "@/src/components/states/error-state";
import ActiveTabSelector from "../../ui/active-tab-selector";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RankingInfoModal from "./ranking-info-modal";

const TABS = [
  { id: "returned_total", label: "Wystawiający" },
  { id: "collected_total", label: "Odbierający" },
] as const;

export default function RankingScreen() {
  const navigation = useNavigation();
  const [isInfoVisible, setIsInfoVisible] = useState(false);
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsInfoVisible(true)}
          style={styles.infoButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
        data={remainingUsers}
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

      <RankingInfoModal
        visible={isInfoVisible}
        onClose={() => setIsInfoVisible(false)}
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
  infoButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
});
