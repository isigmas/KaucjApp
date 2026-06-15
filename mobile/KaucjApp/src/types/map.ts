/**
 * Which categories of points are rendered on the map. Consumed by the map's
 * logic layer (search + markers hooks) to decide which queries to run and which
 * cached results to surface.
 */
export type MapFilter = "all" | "offers" | "machines";

/** The kind of entity a marker represents. */
export type MapItemType = "offer" | "machine";

/**
 * A lightweight pointer to the entity currently selected on the map.
 *
 * It intentionally carries no domain data: detail screens resolve the full
 * entity from the query cache by `id` (the single source of truth), so the
 * marker, the cache, and the details sheet can never drift apart. The
 * coordinates exist only so the map can recenter on the selection.
 */
export interface SelectedMapItem {
  type: MapItemType;
  id: number;
  latitude: number;
  longitude: number;
}
