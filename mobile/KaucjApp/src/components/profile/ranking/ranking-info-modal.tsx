import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/src/theme";

interface RankingInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RankingInfoModal({
  visible,
  onClose,
}: RankingInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Jak działa ranking?</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalText}>
            Punkty w rankingu są przyznawane za Twoją aktywność.
          </Text>
          <Text style={styles.modalText}>
            Obok każdego użytkownika znajduje się liczba opakowań PET, które
            wystawił jako ofertę lub odebrał jako kurier.
          </Text>

          <Text style={styles.modalText}>
            Ilość opakowań jest naliczana za każdą zakończoną ofertę.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderRadius: 16,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
  },
});
