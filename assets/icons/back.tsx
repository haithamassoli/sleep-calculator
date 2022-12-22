import * as React from "react";
import Svg, { Path } from "react-native-svg";
import Colors from "../../src/colors";

const BackIcon = ({ flip }) => (
  <Svg
    viewBox="0 0 384 512"
    fill={Colors.darkText}
    stroke={Colors.darkText}
    width={20}
    height={20}
    rotation={flip ? 180 : 0}
  >
    <Path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 278.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
  </Svg>
);

export default BackIcon;
