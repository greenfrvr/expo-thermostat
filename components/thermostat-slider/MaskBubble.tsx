import { Circle } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { pxToRad } from "./utils";

const { width } = Dimensions.get('window');

const _offset = pxToRad(140, width * 0.9) //sorry for the magic numbers, didn't have time to do proper math
const _initTheta = Math.PI / 2 + _offset; //start angle for the animation
const _steps = 15; // how many repetitions per whole animation
const _thetaStep = Math.PI / _steps; //angle step for each repetition
const _animationDuration = 1500; //total animation duration
const _durationPerStep = _animationDuration / _steps; //duration for each repetition

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
  const rFactor = useSharedValue(1.05); //just to add some randomnes to the bubble coors

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
  }, [isEnabled, theta, delay, expandAnim, rFactor]);

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