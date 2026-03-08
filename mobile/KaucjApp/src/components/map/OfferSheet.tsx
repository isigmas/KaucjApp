import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Info, User, X } from "lucide-react-native";
import { colors } from "@/src/theme";
import type { Offer } from "@/src/lib/mockData";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

const BOTTLE_NAMES: Record<number, string> = {
  1: "Butelka szklana 0,5 L",
  2: "Butelka PET 1,5 L",
  3: "Butelka szklana 0,33 L",
  4: "Puszka aluminiowa",
};

function bottleName(id: number): string {
  return BOTTLE_NAMES[id] ?? `Butelka #${id}`;
}

interface OfferSheetProps {
  offer: Offer;
  onClose: () => void;
  onReserve: () => void;
}

export function OfferSheet({ offer, onClose, onReserve }: OfferSheetProps) {
  const insets = useSafeAreaInsets();

  // Earnings = sum of (price - fee) * quantity for each item
  const totalEarnings = offer.items.reduce(
    (sum, i) => sum + (i.price - i.fee) * i.quantity,
    0,
  );

  return (
    <View style={[styles.container, { height: SHEET_HEIGHT, paddingBottom: insets.bottom + 12 }]}>
      {/* Handle bar */}
      <View style={styles.handleRow}>
        <View style={styles.handle} />
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
          <X size={18} color={colors.text.muted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Address */}
        <View style={styles.row}>
          <MapPin size={18} color={colors.primary.base} />
          <Text style={styles.address}>{offer.address}</Text>
        </View>

        {/* Pickup info */}
        <View style={styles.row}>
          <Info size={18} color={colors.accent.base} />
          <Text style={styles.pickup}>{offer.pickup_info}</Text>
        </View>

        {/* User */}
        <View style={styles.row}>
          <User size={18} color={colors.text.secondary} />
          <Text style={styles.username}>{offer.user.username}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Items header */}
        <View style={styles.itemHeader}>
          <Text style={[styles.sectionTitle, { flex: 1 }]}>Butelki</Text>
          <Text style={[styles.sectionTitle, { width: 50, textAlign: "center" }]}>Opłata</Text>
          <Text style={[styles.sectionTitle, { width: 60, textAlign: "right" }]}>Zarobek</Text>
        </View>

        {/* Items list */}
        {offer.items.map((item, idx) => {
          const itemEarnings = (item.price - item.fee) * item.quantity;
          return (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{bottleName(item.bottle_id)}</Text>
                <Text style={styles.itemQty}>× {item.quantity}</Text>
              </View>
              <Text style={styles.itemFee}>
                {item.fee === 0 ? "—" : `${(item.fee * item.quantity).toFixed(2)} zł`}
              </Text>
              <Text style={[styles.itemEarnings, itemEarnings < 0 && styles.negative]}>
                {itemEarnings === 0
                  ? "Za darmo"
                  : `${itemEarnings > 0 ? "+" : ""}${itemEarnings.toFixed(2)} zł`}
              </Text>
            </View>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Twój zarobek</Text>
          <Text style={[styles.totalValue, totalEarnings < 0 && styles.negative]}>
            {totalEarnings === 0
              ? "Za darmo"
              : `${totalEarnings > 0 ? "+" : ""}${totalEarnings.toFixed(2)} zł`}
          </Text>
        </View>
      </ScrollView>

      {/* Reserve button */}
      <Pressable
        style={({ pressed }) => [styles.reserveBtn, pressed && styles.reserveBtnPressed]}
        onPress={onReserve}
      >
        <Text style={styles.reserveText}>Zarezerwuj</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 16,
  },

  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.status.border,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background.subtle,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  address: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  pickup: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.status.border,
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.background.subtle,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: "500",
  },
  itemQty: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: "600",
  },
  itemFee: {
    width: 50,
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.muted,
    textAlign: "center",
  },
  itemEarnings: {
    width: 60,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary.dark,
    textAlign: "right",
  },
  negative: {
    color: colors.status.error,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary.base,
  },

  reserveBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: colors.primary.base,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  reserveBtnPressed: {
    backgroundColor: colors.primary.dark,
  },
  reserveText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
