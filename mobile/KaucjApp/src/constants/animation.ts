import { LinearTransition } from "react-native-reanimated";

export const layoutSpring = LinearTransition.springify()
  .damping(50)
  .stiffness(500)
  .mass(2.5);
