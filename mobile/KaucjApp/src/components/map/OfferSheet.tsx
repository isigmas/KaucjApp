import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Info, User, X, Star } from "lucide-react-native";
import { colors } from "@/src/theme";
import type { Offer } from "@/src/lib/mockData";
import { fetchUserRating, type UserRating } from "@/src/lib/api";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65; 

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
  onReserve: (offer: Offer) => void;
}

export function OfferSheet({ offer, onClose, onReserve }: OfferSheetProps) {
  const insets = useSafeAreaInsets();

  // ── User rating ─────────────────────────────────────────────────────────
  const [rating, setRating] = useState<UserRating | null>(null);
  const [ratingLoading, setRatingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRatingLoading(true);
    setRating(null);

    fetchUserRating(offer.user.user_id)
      .then((data) => { if (!cancelled) setRating(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRatingLoading(false); });

    return () => { cancelled = true; };
  }, [offer.user.user_id]);
  
  // Twój zarobek (suma price)
  const totalEarnings = offer.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Opłata dla wystawiającego (suma fee)
  const totalFee = offer.items.reduce(
    (sum, item) => sum + item.fee * item.quantity,
    0,
  );

  // Całkowita wartość butelek (price + fee)
  const totalTogether = offer.items.reduce(
    (sum, item) => sum + (item.price + item.fee) * item.quantity,
    0,
  );
  
  const NAVBAR_BUFFER = 55;

  // ── Animacje ────────────────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 150, 
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim]);

  const handleReserve = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onReserve(offer);
    });
  }, [onReserve, offer, slideAnim]);

  // Ekstremalnie szybki wjazd komponentu
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      stiffness: 700, // Mocno naciągnięta sprężyna = błyskawiczny start
      damping: 30,    // Tłumienie trzymające ją w ryzach (brak odbijania)
      mass: 0.1,      // Minimalna masa = zero bezwładności na starcie
    }).start();
  }, [slideAnim]);

  // ── Gesty (Swipe to dismiss) ────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 1.2) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 700,
            damping: 30,
            mass: 0.1,
          }).start();
        }
      },
    })
  ).current;

  // ────────────────────────────────────────────────────────────────────────

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height: SHEET_HEIGHT, 
          paddingBottom: insets.bottom + NAVBAR_BUFFER,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <Pressable 
        onPress={handleClose} 
        style={styles.closeBtn} 
        hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
      >
        <X size={24} color={colors.text.muted} />
      </Pressable>

      <View style={styles.headerArea} {...panResponder.panHandlers}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <MapPin size={18} color={colors.primary.base} />
          <Text style={styles.address}>{offer.address}</Text>
        </View>

        <View style={styles.row}>
          <Info size={18} color={colors.accent.base} />
          <Text style={styles.pickup}>{offer.pickup_info}</Text>
        </View>

        <View style={styles.row}>
          <User size={18} color={colors.text.secondary} />
          <Text style={styles.username}>{offer.user.username}</Text>
          {ratingLoading ? (
            <ActivityIndicator size="small" color={colors.status.warning} />
          ) : rating ? (
            <View style={styles.ratingBadge}>
              <Star size={13} color={colors.status.warning} fill={colors.status.warning} />
              <Text style={styles.ratingText}>
                {rating.current_avg.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>({rating.number_of_feedbacks})</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Butelki</Text>

        {offer.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{bottleName(item.bottle_id)}</Text>
              <Text style={styles.itemQty}>× {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {item.price <= 0
                ? "0.00 zł"
                : `+${(item.price * item.quantity).toFixed(2)} zł`}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Razem</Text>
            <Text style={styles.summaryValueBase}>
              {totalTogether <= 0 ? "0.00 zł" : `${totalTogether.toFixed(2)} zł`}
            </Text>
          </View>

          <View style={[styles.summaryRow, { marginTop: 2 }]}>
            <Text style={styles.summaryLabel}>Dla wystawiającego</Text>
            <Text style={styles.summaryValueFee}>
              {totalFee <= 0 ? "0.00 zł" : `-${totalFee.toFixed(2)} zł`}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.summaryHighlightRow]}>
            <Text style={styles.summaryLabelHighlight}>Zarobisz</Text>
            <Text style={styles.summaryValueHighlight}>
              {totalEarnings <= 0 ? "0.00 zł" : `+${totalEarnings.toFixed(2)} zł`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.reserveBtn, pressed && styles.reserveBtnPressed]}
        onPress={handleReserve}
      >
        <Text style={styles.reserveText}>Zarezerwuj</Text>
      </Pressable>
    </Animated.View>
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
    zIndex: 50,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  headerArea: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.status.border,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.subtle,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  address: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text.primary },
  pickup: { flex: 1, fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
  username: { fontSize: 14, fontWeight: "600", color: colors.text.primary },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.background.subtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingCount: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.muted,
  },
  divider: { height: 1, backgroundColor: colors.status.border, marginVertical: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 4, backgroundColor: colors.background.subtle, borderRadius: 10, marginBottom: 6 },
  itemInfo: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, paddingLeft: 8 },
  itemName: { fontSize: 14, color: colors.text.primary, fontWeight: "500" },
  itemQty: { fontSize: 13, color: colors.text.muted, fontWeight: "600" },
  itemPrice: { fontSize: 14, fontWeight: "700", color: colors.primary.dark, paddingRight: 8 },
  
  summaryContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  summaryRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryHighlightRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  summaryLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: colors.text.secondary 
  },
  summaryValueBase: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  summaryValueFee: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: colors.status.error 
  },
  summaryLabelHighlight: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: colors.text.primary 
  },
  summaryValueHighlight: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: colors.primary.base 
  },
  
  reserveBtn: { marginHorizontal: 20, marginTop: 5, backgroundColor: colors.primary.base, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  reserveBtnPressed: { backgroundColor: colors.primary.dark },
  reserveText: { color: colors.text.white, fontSize: 16, fontWeight: "700" },
});