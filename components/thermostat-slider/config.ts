import { Dimensions } from "react-native";
import { MaskBubbleProps } from "./MaskBubble";
import { pxToRad } from "./utils";

const { width, height } = Dimensions.get('window');
const _radius = width * 0.9; //radius of the circle
const _center = width + 25; //center of the circle
const _centerY = height / 2 - 50; //center of the circle
const _units = 600;
const _unitsStep = 20;

const _bellCommonParams = {
  center: _center,
  centerY: _centerY,
  radius: _radius,
  units: _units,
  bellCenter: 300,
  innerBase: -36,
  outerOffset: 28,
};

const _ticksCommonParams = {
  center: _center,
  centerY: _centerY,
  radius: _radius - 28,
  start: 0,
  end: _units,
  units: _units - 100,
  unitsStep: _unitsStep,
}

const bubblesConfig: Partial<MaskBubbleProps>[] = [
  {
    rxOffset: 12,
    ryOffset: 7,
    maxRadius: 22,
  },
  {
    rxOffset: -15,
    ryOffset: -12,
    delay: 30,
    thetaOffset: pxToRad(20, _radius),
    maxRadius: 22,
  },
  {
    rxOffset: 17,
    ryOffset: 10,
    thetaOffset: pxToRad(20, _radius),
    maxRadius: 18,
    delay: 50,
  },
  {
    rxOffset: -10,
    ryOffset: -14,
    maxRadius: 18,
    thetaOffset: pxToRad(22, _radius),
    delay: 70,
  },
  {
    rxOffset: 17,
    ryOffset: 12,
    maxRadius: 16,
    thetaOffset: pxToRad(24, _radius),
    delay: 100,
  },
  {
    rxOffset: -12,
    ryOffset: -17,
    maxRadius: 16,
    thetaOffset: pxToRad(24, _radius),
    delay: 110,
  },
  {
    rxOffset: 17,
    ryOffset: 12,
    maxRadius: 12,
    thetaOffset: pxToRad(28, _radius),
    delay: 140,
  },
  {
    rxOffset: -12,
    ryOffset: 7,
    maxRadius: 12,
    thetaOffset: pxToRad(30, _radius),
    delay: 160,
  },
]

export const CONFIG = {
  radius: _radius,
  centerX: _center,
  centerY: _centerY,
  units: _units,
  unitsStep: _unitsStep,
  bellTicksParams: {..._bellCommonParams, bellAmp: 20, bellSigma: 5},
  bellTicksExpandedParams: {..._bellCommonParams, bellAmp: 24, bellSigma: 7},
  ticksCommonParams: _ticksCommonParams,
  bubblesConfig,
}