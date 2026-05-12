import SectionCard from "@/src/components/map/details/section-card";
import { colors, rounded, spacing } from "@/src/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ErrorState from "../../states/error-state";
import EmptyState from "../../states/empty-state";
import { useGetOfferComplaints } from "@/src/api/hooks/use-offer";

interface ComplaintCardProps {
  offerId: number;
  asCard?: boolean;
}

//  interface Complaint {
//     complaint_id: number;
//     offer_id: number;
//     complainant: Complainant;
//     complaint_reason: ComplaintReason;
//     message: string;
//   }

export default function ComplaintCard({
  offerId,
  asCard = false,
}: ComplaintCardProps) {
  const {
    data: complaints,
    isError,
    error,
    refetch,
  } = useGetOfferComplaints(offerId);

  if (isError) {
    return (
      <ErrorState
        title="Nie udało się załadować danych kuriera"
        message={error?.message || "Spróbuj ponownie."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!complaints || complaints.length === 0) {
    return <EmptyState title="Brak skarg na tę ofertę" />;
  }

  return (
    <View style={[styles.complaintSection, asCard && styles.card]}>
      <Text style={styles.sectionLabel}>Skarga</Text>
      {complaints.map((complaint) => (
        <View key={complaint.complaint_id}></View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  complaintSection: {
    gap: spacing.sm,
    backgroundColor: colors.status.error + "10",
    padding: spacing.md,
    borderRadius: rounded.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
});
