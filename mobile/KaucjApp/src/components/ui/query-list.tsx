import EmptyState from "@/src/components/states/empty-state";
import ErrorState from "@/src/components/states/error-state";
import LoadingState from "@/src/components/states/loading-state";
import { spacing } from "@/src/theme";
import { ApiError } from "@/src/api/api-error";
import { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export interface QueryListCopy {
  loadingTitle: string;
  errorTitle: string;
  errorMessage: string;
  emptyTitle: string;
}

interface QueryListProps<T> {
  query: UseQueryResult<T[], ApiError>;
  fallbackStates: QueryListCopy;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function QueryList<T>({
  query,
  fallbackStates,
  renderItem,
  keyExtractor,
}: QueryListProps<T>) {
  const { data, isLoading, isError, error, refetch } = query;

  if (isLoading) {
    return (
      <View>
        <LoadingState title={fallbackStates.loadingTitle} />
      </View>
    );
  }

  if (isError) {
    const message = error?.message || fallbackStates.errorMessage;
    return (
      <View>
        <ErrorState
          title={fallbackStates.errorTitle}
          message={message}
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View>
        <EmptyState title={fallbackStates.emptyTitle} />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(180)} style={styles.list}>
      {data.map((item) => (
        <React.Fragment key={keyExtractor(item)}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </Animated.View>
  );
}

export default QueryList;

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.sm,
  },
});
