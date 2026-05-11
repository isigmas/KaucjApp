import BookingDetailsScreen from "@/src/components/profile/reserved-offers/booking-details-screen";
import ErrorState from "@/src/components/states/error-state";
import { useLocalSearchParams } from "expo-router";

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offerId = Number(id);

  if (!Number.isFinite(offerId)) {
    return (
      <ErrorState
        title="Wystąpił błąd"
        onRetry={() => {}}
        message="Nieprawidłowy ID"
      />
    );
  }

  return <BookingDetailsScreen offerId={offerId} />;
}
