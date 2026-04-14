import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function OfferStatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  let variant: "default" | "secondary" | "destructive" | "outline" =
    "secondary";
  let customClasses = "";

  if (["PENDING", "OPEN"].includes(normalizedStatus)) {
    variant = "secondary";
    customClasses =
      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent";
  } else if (["COMPLETED", "CLOSED"].includes(normalizedStatus)) {
    variant = "default";
    customClasses =
      "bg-green-100 text-green-800 hover:bg-green-200 border-transparent";
  } else if (["CANCELLED", "FAILED"].includes(normalizedStatus)) {
    variant = "destructive";
  }

  return (
    <Badge variant={variant} className={customClasses}>
      {status}
    </Badge>
  );
}
