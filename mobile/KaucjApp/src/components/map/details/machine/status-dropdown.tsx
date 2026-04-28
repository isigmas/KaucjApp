import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { DepositMachineStatus } from "@/src/types";
import { colors, rounded, spacing } from "@/src/theme";

interface StatusDropdownProps {
  statusLabel: string;
  statusColor: string;
  currentStatus: DepositMachineStatus;
  isPending: boolean;
  onStatusChange: (status: DepositMachineStatus) => void;
}

export default function StatusDropdown({
  statusLabel,
  statusColor,
  currentStatus,
  isPending,
  onStatusChange,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (status: DepositMachineStatus) => {
    setIsOpen(false);

    let actionText = "";
    let title = "Potwierdzenie zgłoszenia";
    switch (status) {
      case "AVAILABLE":
        actionText = "poprawne działanie";
        title = "Zgłoszenie poprawnego działania";
        break;
      case "FULL":
        actionText = "przepełnienie";
        title = "Zgłoszenie przepełnienia";
        break;
      case "OUT_OF_ORDER":
        actionText = "awarię";
        title = "Zgłoszenie awarii";
        break;
    }

    Alert.alert(
      title,
      `Czy na pewno chcesz zgłosić ${actionText} tego kaucjomatu?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Zgłoś",
          style: status === "AVAILABLE" ? "default" : "destructive",
          onPress: () => onStatusChange(status),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.badge,
          { backgroundColor: statusColor, opacity: isPending ? 0.7 : 1 },
        ]}
        onPress={() => setIsOpen(!isOpen)}
        disabled={isPending}
      >
        <Text style={styles.badgeText}>
          {isPending ? "Zgłaszanie..." : `${statusLabel}  ▼`}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {currentStatus !== "AVAILABLE" ? (
            <TouchableOpacity
              style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
              onPress={() => handleSelect("AVAILABLE")}
            >
              <Text style={styles.dropdownText}>Zgłoś poprawne działanie</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelect("FULL")}
              >
                <Text style={styles.dropdownText}>Zgłoś przepełnienie</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={() => handleSelect("OUT_OF_ORDER")}
              >
                <Text style={styles.dropdownText}>Zgłoś awarię</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rounded.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: rounded.apple,
    paddingVertical: spacing.xs,
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
});
