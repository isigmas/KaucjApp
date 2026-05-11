import { useRef, useEffect, useState } from "react";

export function useAccumulatedMapData<T>(
  incomingItems: T[] | undefined,
  getId: (item: T) => string | number,
): T[] {
  const cacheRef = useRef<Map<string | number, T>>(new Map());
  const [accumulated, setAccumulated] = useState<T[]>([]);

  useEffect(() => {
    if (!incomingItems?.length) return;

    let hasChanges = false;

    for (const item of incomingItems) {
      const id = getId(item);
      const existingItem = cacheRef.current.get(id);

      if (
        !existingItem ||
        JSON.stringify(existingItem) !== JSON.stringify(item)
      ) {
        cacheRef.current.set(id, item);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setAccumulated(Array.from(cacheRef.current.values()));
    }
  }, [incomingItems]);

  return accumulated;
}
