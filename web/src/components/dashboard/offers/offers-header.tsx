import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OffersHeaderProps {
  totalCount: number;
}

export function OffersHeader({ totalCount }: OffersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Oferty
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          To lista wszystkich ofert dostępnych w systemie. GET /offer/szosti
        </p>
      </div>

      <Card className="shadow-sm rounded-4xl">
        <CardContent className="flex items-center gap-3">
          <Package className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {totalCount} Ofert
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
