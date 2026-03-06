import { useMemo } from "react";
import { Dimensions } from "react-native";
import Supercluster from "supercluster";
import type { Region } from "react-native-maps";
import type { BottleAd } from "@/src/lib/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Tuning constants ─────────────────────────────────────────────────────────
const CLUSTER_RADIUS = 55;
const MAX_ZOOM = 18;

// ── Types ─────────────────────────────────────────────────────────────────────
export type AdPoint = Supercluster.PointFeature<BottleAd>;

export interface ClusterProps {
  totalBottles: number;
}

export type ClusterPoint = Supercluster.ClusterFeature<ClusterProps>;
export type ClusterOrPoint = AdPoint | ClusterPoint;

// ── Helpers ───────────────────────────────────────────────────────────────────
function regionToZoom(region: Region): number {
  // Precyzyjny wzór kafelkowy (Mercator) uwzględniający szerokość ekranu telefonu
  const zoom = Math.log2((360 * (SCREEN_WIDTH / 256)) / region.longitudeDelta);
  // Używamy Math.floor, aby klaster "trzymał się" dłużej przy przybliżaniu
  return Math.max(0, Math.min(MAX_ZOOM, Math.floor(zoom)));
}

function regionToBBox(region: Region): [number, number, number, number] {
  // PANCERNY FIX: Jeśli mapa jest mocno oddalona, po prostu pobieramy klastry 
  // dla całego globu. Omija to błędy matematyczne react-native-maps przy krawędziach.
  if (region.longitudeDelta > 60) {
    return [-180, -90, 180, 90];
  }

  // Zwiększony padding do 100% delty, żeby upewnić się, że klastry na brzegach 
  // ekranu nie będą znikać przy przesuwaniu mapy.
  const paddingLat = region.latitudeDelta;
  const paddingLng = region.longitudeDelta;

  let minLng = Math.max(-180, region.longitude - (region.longitudeDelta / 2) - paddingLng);
  let minLat = Math.max(-90, region.latitude - (region.latitudeDelta / 2) - paddingLat);
  let maxLng = Math.min(180, region.longitude + (region.longitudeDelta / 2) + paddingLng);
  let maxLat = Math.min(90, region.latitude + (region.latitudeDelta / 2) + paddingLat);

  return [minLng, minLat, maxLng, maxLat];
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useClusters(
  ads: BottleAd[],
  region: Region
): ClusterOrPoint[] {
  const index = useMemo(() => {
    const sc = new Supercluster<BottleAd, ClusterProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: MAX_ZOOM,
      minZoom: 0, 
      map: (props) => ({ totalBottles: props.bottleCount }),
      reduce: (accumulated, props) => {
        accumulated.totalBottles += props.totalBottles;
      },
    });

    sc.load(
      ads.map((ad) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [ad.coordinate.longitude, ad.coordinate.latitude],
        },
        properties: ad,
      }))
    );

    return sc;
  }, [ads]);

  const clusters = useMemo(() => {
    if (!region || !region.longitudeDelta) return [];

    return index.getClusters(
      regionToBBox(region),
      regionToZoom(region)
    ) as ClusterOrPoint[];
  }, [index, region]);

  return clusters;
}

// ── Type guards ───────────────────────────────────────────────────────────────
export function isCluster(item: ClusterOrPoint): item is ClusterPoint {
  return "cluster" in item.properties && item.properties.cluster === true;
}