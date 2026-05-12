import { colors, rounded, spacing } from "@/src/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ErrorState from "../../states/error-state";
import { useGetOfferComplaints } from "@/src/api/hooks/use-offer";
import { MessageSquareWarning } from "lucide-react-native";
import { getComplaintReasonLabel } from "@/src/lib";

interface ComplaintCardProps {
  offerId: number;
  asCard?: boolean;
}

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
        title="Nie udało się załadować skarg na tę ofertę"
        message={error?.message || "Spróbuj ponownie."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!complaints || complaints.length === 0) {
    return null;
  }

  return (
    <View style={[styles.complaintSection, asCard && styles.card]}>
      <Text style={styles.sectionLabel}>Moje zgłoszenia</Text>
      <View style={styles.listContainer}>
        {complaints.map((complaint) => (
          <React.Fragment key={complaint.complaintId}>
            <View style={styles.complaintItem}>
              <View style={styles.reasonRow}>
                <MessageSquareWarning size={16} color={colors.status.error} />
                <Text style={styles.reasonText}>
                  {getComplaintReasonLabel(
                    complaint.complaintReason,
                    complaint.complainant,
                  )}
                </Text>
              </View>

              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{complaint.message}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  complaintSection: {
    backgroundColor: colors.status.error + "10",
    padding: spacing.md,
    borderRadius: rounded.xl,
    gap: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.status.error + "30",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.status.error,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContainer: {
    gap: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.status.error + "20",
    marginVertical: spacing.xs,
  },
  complaintItem: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.status.error + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: rounded.lg,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  messageBubble: { marginLeft: spacing.sm + 16 },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
});
