import { Circle } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import { Dimensions } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { pxToRad } from "./utils";

const { width } = Dimensions.get('window');

const _offset = pxToRad(50, width * 0.9) //(Math.PI * 14 / 180 )
const _initTheta = - 3 * Math.PI / 2 + _offset;
const _steps = 24;                      // how many positions per loop
const _thetaStep = 3 * Math.PI / 2 / _steps;
const _animationDuration = 2400;
const _durationPerStep = _animationDuration / _steps;

export type MaskBubbleProps = {
  center: number;
  centerY: number;
  radius: number;
  isEnabled: boolean;
  thetaOffset?: number;
  rxOffset?: number;
  ryOffset?: number;
  delay?: number;
  maxRadius?: number;
  children?: React.ReactNode;
}

export const MaskBubble = (props: MaskBubbleProps) => {
  const {
    center,
    centerY,
    radius,
    isEnabled,
    thetaOffset = 0,
    rxOffset = 0,
    ryOffset = 0,
    delay = 0,
    maxRadius = 20,
    children,
  } = props;

  const expandAnim = useSharedValue(0.2);
  const theta = useSharedValue(_initTheta);

  useEffect(() => {
    if (isEnabled) {
      expandAnim.value = withDelay(delay, withRepeat(
        withTiming(1, { duration: _durationPerStep, easing: Easing.linear }, (finished) => {
          'worklet';
          if (finished) {
            theta.value = withTiming(theta.value + _thetaStep, { duration: 1 });
          }
        }), _steps, false));
    } else {
      theta.value = _initTheta;
      expandAnim.value = 0.2;
    }
  }, [isEnabled, theta, delay, expandAnim]);


  const rFactor = useMemo(() => (Math.random() * 2 - 1) * 1.1, []);

  const cxSV = useDerivedValue(() => center + (radius + rxOffset + rFactor) * Math.cos(theta.value + thetaOffset));
  const cySV = useDerivedValue(() => centerY + (radius + ryOffset + rFactor) * Math.sin(theta.value + thetaOffset));
  const rSV = useDerivedValue(() => maxRadius * expandAnim.value);

  return (
    <Circle
      cx={cxSV}
      cy={cySV}
      r={rSV}
      style="fill"
      strokeCap="round"
      color="white"
    >
      {children}
    </Circle>
  )
}