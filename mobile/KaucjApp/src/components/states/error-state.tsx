import { colors } from "@/src/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.errorTitle}>{title}.</Text>
      {message && <Text style={styles.errorText}>{message}</Text>}
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  errorTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 4,
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
  errorText: {
    color: "#F44336",
    fontSize: 16,
  },
});
