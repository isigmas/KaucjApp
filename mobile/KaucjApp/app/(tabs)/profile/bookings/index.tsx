import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Package, CheckCircle, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { colors } from "@/src/theme";
import { fetchReservedOffers, completeOffer } from "@/src/lib/api";
import type { Offer } from "@/src/lib/mockData";

// TODO: replace with real auth user id once auth is implemented
const CURRENT_USER_ID = 1;

const BOTTLE_NAMES: Record<number, string> = {
  1: "Butelka szklana 0,5 L",
  2: "Butelka PET 1,5 L",
  3: "Butelka szklana 0,33 L",
  4: "Puszka aluminiowa",
};

function bottleName(id: number): string {
  return BOTTLE_NAMES[id] ?? `Butelka #${id}`;
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadOffers = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchReservedOffers(CURRENT_USER_ID);
      setOffers(data);
    } catch (err: any) {
      setError(err.message ?? "Nie udało się pobrać rezerwacji.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadOffers().finally(() => setLoading(false));
  }, [loadOffers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOffers();
    setRefreshing(false);
  }, [loadOffers]);

  const handleComplete = useCallback(async (offerId: number) => {
    setCompletingId(offerId);
    try {
      await completeOffer(offerId, CURRENT_USER_ID);
      setOffers((prev) => prev.filter((o) => o.offer_id !== offerId));
    } catch (err: any) {
      setError(err.message ?? "Nie udało się potwierdzić odbioru.");
    } finally {
      setCompletingId(null);
    }
  }, []);

  const totalEarnings = offers.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0,
  );

  const renderItem = ({ item }: { item: Offer }) => {
    const earnings = item.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalQty = item.items.reduce((s, i) => s + i.quantity, 0);
    const isCompleting = completingId === item.offer_id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.primary.base} />
            <Text style={styles.address} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
          <Text style={styles.earnings}>+{earnings.toFixed(2)} zł</Text>
        </View>

        {item.pickup_info ? (
          <Text style={styles.pickupInfo} numberOfLines={2}>
            {item.pickup_info}
          </Text>
        ) : null}

        <View style={styles.itemsList}>
          {item.items.map((bi, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Package size={14} color={colors.text.secondary} />
              <Text style={styles.itemText}>
                {bottleName(bi.bottle_id)} × {bi.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                +{(bi.price * bi.quantity).toFixed(2)} zł
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalQty}>{totalQty} szt.</Text>
          <Text style={styles.creatorLabel}>
            od {item.user.username}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.completeButton,
            pressed && styles.completeButtonPressed,
            isCompleting && styles.completeButtonDisabled,
          ]}
          onPress={() => handleComplete(item.offer_id)}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <>
              <CheckCircle size={18} color={colors.text.white} />
              <Text style={styles.completeButtonText}>Potwierdź odbiór</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Moje rezerwacje</Text>
        <View style={{ width: 40 }} />
      </View>

      {offers.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {offers.length} {offers.length === 1 ? "rezerwacja" : offers.length < 5 ? "rezerwacje" : "rezerwacji"}
          </Text>
          <Text style={styles.summaryEarnings}>
            Zarobisz: {totalEarnings.toFixed(2)} zł
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.base} />
        </View>
      ) : error && offers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => { setLoading(true); loadOffers().finally(() => setLoading(false)); }} style={styles.retryButton}>
            <Text style={styles.retryText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.center}>
          <Package size={48} color={colors.text.muted} />
          <Text style={styles.emptyTitle}>Brak rezerwacji</Text>
          <Text style={styles.emptySubtitle}>
            Zarezerwowane oferty pojawią się tutaj
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.offer_id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.base}
              colors={[colors.primary.base]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.border,
    backgroundColor: colors.background.card,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary.light,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  summaryEarnings: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.status.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  address: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  earnings: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary.base,
  },
  pickupInfo: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 10,
    paddingLeft: 22,
  },
  itemsList: {
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemText: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.dark,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.status.border,
  },
  totalQty: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  creatorLabel: {
    fontSize: 13,
    color: colors.text.muted,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary.base,
    borderRadius: 12,
    paddingVertical: 14,
  },
  completeButtonPressed: {
    backgroundColor: colors.primary.dark,
  },
  completeButtonDisabled: {
    opacity: 0.7,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.white,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary.base,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.white,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
