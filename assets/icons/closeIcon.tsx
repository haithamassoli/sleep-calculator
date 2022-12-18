import * as React from "react";
import Svg, { Path } from "react-native-svg";

const CloseIcon = () => (
  <Svg
    width={32}
    height={32}
    scaleX={1.4}
    scaleY={1.4}
    fill="white"
    stroke="white"
  >
    <Path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export default CloseIcon;
