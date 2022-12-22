import * as React from "react";
import Svg, { Path } from "react-native-svg";
import Colors from "../../src/colors";

const BedIcon = (props) => (
  <Svg
    viewBox="0 0 640 512"
    {...props}
    stroke="white"
    color="white"
    width={22}
    height={22}
    fill={Colors.darkText}
  >
    <Path d="M32 32c17.7 0 32 14.3 32 32v256h224V160c0-17.7 14.3-32 32-32h224c53 0 96 43 96 96v224c0 17.7-14.3 32-32 32s-32-14.3-32-32v-32H64v32c0 17.7-14.3 32-32 32S0 465.7 0 448V64c0-17.7 14.3-32 32-32zm144 256c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" />
  </Svg>
);

export default BedIcon;
