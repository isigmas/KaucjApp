import { colors } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  onRefresh?: () => void;
}

export default function EmptyState({ title, onRefresh }: EmptyStateProps) {
  return (
    <View style={styles.centeredContainer}>
      <View style={styles.emptyState}>
        <Ionicons
          name="receipt-outline"
          size={48}
          color={colors.status.border}
        />
        <Text style={styles.emptyStateText}>{title}</Text>

        {onRefresh && (
          <Pressable style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Odświez</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    padding: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary.base,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 32,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
