import { Circle } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { pxToRad } from "./utils";

const { width } = Dimensions.get('window');

const _offset = pxToRad(140, width * 0.9) //(Math.PI * 14 / 180 )
const _initTheta = Math.PI / 2 + _offset;
const _steps = 15;                      // how many positions per loop
const _thetaStep = Math.PI / _steps;
const _animationDuration = 1500;
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

  const expandAnim = useSharedValue(0.15);
  const theta = useSharedValue(_initTheta);
  const rFactor = useSharedValue(1.05);

  useEffect(() => {
    if (isEnabled) {
      expandAnim.value = withDelay(delay, withRepeat(
        withTiming(1, { duration: _durationPerStep, easing: Easing.linear }, (finished) => {
          'worklet';
          if (finished) {
            theta.value = withTiming(theta.value + _thetaStep, { duration: 1 });
            rFactor.value = (Math.random() * 2 - 1) * 1.1;
          }
        }), _steps, false));
    } else {
      theta.value = _initTheta;
      expandAnim.value = 0.15;
    }
  }, [isEnabled, theta, delay, expandAnim]);


  // const rFactor = useMemo(() => (Math.random() * 2 - 1) * 1.1, []);

  const cxSV = useDerivedValue(() => center + (radius + rxOffset + rFactor.value) * Math.cos(theta.value + thetaOffset));
  const cySV = useDerivedValue(() => centerY + (radius + ryOffset + rFactor.value) * Math.sin(theta.value + thetaOffset));
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