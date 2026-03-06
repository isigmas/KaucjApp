import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { colors } from "@/src/theme";

interface SearchBarOverlayProps {
  /** Placeholder text shown in the search field */
  placeholder?: string;
}

export function SearchBarOverlay({
  placeholder = "Szukaj butelek w okolicy…",
}: SearchBarOverlayProps) {
  const insets = useSafeAreaInsets();
  const topOffset = insets.top + 8 + 40 + 10 + 12;

  return (
    <View style={[styles.wrapper, { top: topOffset }]}>
      <View style={styles.bar}>
        <Search size={18} color={colors.text.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          editable={false}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    padding: 0,
  },
});
