import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function useCountUp(target: number, duration = 1200, delay = 100) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animated, {
        toValue: target,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return animated;
}
