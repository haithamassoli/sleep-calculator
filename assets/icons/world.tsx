import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import Colors from "../../src/colors";

const WorldIcon = () => (
  <Svg width={24} height={24} fill="white" stroke={Colors.mainBackground}>
    <Circle cx={12} cy={12} r={10} />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export default WorldIcon;
