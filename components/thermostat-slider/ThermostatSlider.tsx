import { useTheme } from '@/hooks/useTheme';
import {
  Canvas,
  Circle,
  Group,
  Mask,
  Path,
  SweepGradient,
  usePathInterpolation,
  vec
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Easing, interpolate, SharedValue, useDerivedValue, useSharedValue, withDecay, withSequence, withTiming } from 'react-native-reanimated';
import { MaskBubble, MaskBubbleProps } from './MaskBubble';
import { createBellTicksPath, createUnitsPath, createUnitsPath2, pxToRad, ringSegmentPath } from './utils';

const { width, height } = Dimensions.get('window');

const _units = 600;
const _unitsStep = 20;
const _strokeWidth = 40;
const _gradientColors = ['#00BFFF', '#00FF7F', '#FFD700', '#ee5f26', '#00BFFF'];
const _minTemperature = 62;
const _maxTemperature = 86;
const _tempDelta = _maxTemperature - _minTemperature;
const _minThreshold = -0.85;
const _maxThreshold = 1.85;
const _thresholdDelta = _maxThreshold - _minThreshold;
const _radius = width * 0.9;
const _center = width + 25;
const _centerY = height / 2 - 50;

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

interface ThermostatGradientCircleProps {
  isEnabled: boolean;
  temperature: SharedValue<number>;
  style?: any;
}

export const ThermostatGradientCircle = (props: ThermostatGradientCircleProps) => {
  const {
    isEnabled,
    temperature,
    style
  } = props;

  const theme = useTheme();

  const rotation = useSharedValue(0.3);
  const lastAngle = useSharedValue(0.3);

  const bellAnim = useSharedValue(0);
  const bellStartAnim = useSharedValue(1);

  const maskAnimation = useSharedValue(0);

  useEffect(() => {
    bellAnim.value = withSequence(withTiming(1, { duration: 550, easing: Easing.bezier(0.25, 0.1, 0.25, 1.37) }), withTiming(0, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    bellStartAnim.value = withTiming(0, { duration: 550, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, []);

  useEffect(() => {
    maskAnimation.value = withTiming(isEnabled ? 1 : 0, { duration: isEnabled ? 3000 : 700, easing: Easing.linear });
  }, [isEnabled, maskAnimation]);

  useDerivedValue(() => {
    const t = (1 - (rotation.value - _minThreshold) / _thresholdDelta) * _tempDelta + _minTemperature;
    temperature.value = Math.round(t);
  });

  const gesture = Gesture.Pan()
    .onBegin(({ absoluteX, absoluteY }) => {
      if (lastAngle.value !== 0) {
        lastAngle.value = Math.atan2(-(absoluteY - _centerY), (absoluteX - _center));
      }
      bellAnim.value = withTiming(1, { duration: 200 });
    })
    .onUpdate(({ absoluteX, absoluteY }) => {
      const angle = Math.atan2(-(absoluteY - _centerY), (absoluteX - _center));
      //angle difference from previous frame
      const angleDiff = angle - lastAngle.value;
      //shortest signed angular change, normalized to [-π, π]
      const delta = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      const newRotation = rotation.value - delta;

      if (newRotation > _minThreshold && newRotation < _maxThreshold) {
        rotation.value = newRotation;
        lastAngle.value = angle;
      } else if (newRotation < _minThreshold) {
        rotation.value = _minThreshold;
      } else if (newRotation > _maxThreshold) {
        rotation.value = _maxThreshold;
      }

      const newTempValue = (1 - (rotation.value - _minThreshold) / _thresholdDelta) * _tempDelta + _minTemperature;
      temperature.value = Math.round(newTempValue);
    })
    .onTouchesUp(() => {
      bellAnim.value = withTiming(0, { duration: 200 });
    })
    .onEnd(({ absoluteX, absoluteY, velocityX, velocityY }) => {
      // position relative to center (invert Y to match angleAt)
      const rx = absoluteX - _center;
      const ry = - (absoluteY - _centerY);

      // velocity in same coord system
      const vx = velocityX;
      const vy = -velocityY;

      // angular velocity (rad/s): ω = (r x v) / |r|^2
      const r2 = rx * rx + ry * ry;
      if (r2 > 1) {
        const omega = (rx * vy - ry * vx) / r2; // rad/s

        rotation.value = withDecay({
          velocity: -omega * 0.5,          // sign matches your update (flip if needed)
          deceleration: 0.995,       // 0.99..0.999 (tune)
          clamp: [_minThreshold, _maxThreshold],
        });
      }

      bellAnim.value = withTiming(0, { duration: 200 });
    })
    .enabled(isEnabled);

  const bellTicks = useMemo(() => createBellTicksPath({
    ..._bellCommonParams,
    bellAmp: 20,
    bellSigma: 5,
  }), []);

  const bellTicksExpanded = useMemo(() => createBellTicksPath({
    ..._bellCommonParams,
    bellAmp: 24,
    bellSigma: 7,
  }), []);

  const ticks = useMemo(() => createUnitsPath({
    ..._ticksCommonParams,
  }), []);

  const overlayTicks = useMemo(() => createUnitsPath2({
    ..._ticksCommonParams,
  }), []);

  // const ringSegmentArc = useMemo(() => fullCirclePath(_center, _centerY, _radius), []);
  const ringSegmentArc = useMemo(() => ringSegmentPath(_center, _centerY, _radius, _radius, Math.PI / 2, Math.PI * 3 / 2), []);

  const bellPath = usePathInterpolation(bellAnim, [0, 1], [bellTicks, bellTicksExpanded]);

  const rotateProp = useDerivedValue(() => [{ rotate: rotation.value * 0.8 }]);
  const rotateDecay = useDerivedValue(() => [{ rotate: rotation.value * 0.8 }]);
  const bellRotation = useDerivedValue(() => [{ rotate: bellStartAnim.value }]);

  const pathEnd = useDerivedValue(() => interpolate(maskAnimation.value, [0, 1], [0, 1]));
  const circleColor = useDerivedValue(() => withTiming(isEnabled ? '#525956' : theme.buttonBgColor, { duration: 300 }));

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={[styles.container, { width, height }, style]}>
        <Circle
          cx={_center}
          cy={_centerY}
          r={_radius}
          style="stroke"
          strokeWidth={_strokeWidth}
          color={theme.buttonBgColor}
        />

        <Mask mask={<Circle
          cx={_center}
          cy={_centerY}
          r={_radius}
          style="stroke"
          strokeWidth={_strokeWidth}
          color={'whie'}
        />}>
          <Group>
            {bubblesConfig.map((bubble, index) => (
              <MaskBubble
                key={index}
                {...bubble}
                center={_center}
                centerY={_centerY}
                radius={_radius}
                isEnabled={isEnabled}
              >
                <SweepGradient
                  c={vec(_center, _centerY)}
                  colors={_gradientColors}
                  transform={rotateProp}
                  origin={vec(_center, _centerY)}
                />
              </MaskBubble>
            ))}
          </Group>
        </Mask>

        <Path
          path={ringSegmentArc}
          style="stroke"
          strokeCap="round"
          strokeWidth={_strokeWidth}
          color="white"
          start={0}
          end={pathEnd} // -> 1
        >
          <SweepGradient
            c={vec(_center, _centerY)}
            colors={_gradientColors}
            origin={vec(_center, _centerY)}
            transform={rotateProp}
          />
        </Path>

        <Group
          origin={vec(_center, _centerY)}
          transform={rotateDecay}
        >
          {ticks && <Path
            path={ticks}
            style="stroke"
            strokeWidth={2}
            color={circleColor}
          />}

          {overlayTicks && <Path
            path={overlayTicks}
            style="stroke"
            strokeWidth={2}
            opacity={0.15}
            color={theme.buttonBgColor}
          />}
        </Group>

        {bellPath && <Path
          path={bellPath}
          style="stroke"
          strokeWidth={2}
          color={circleColor}
          origin={vec(_center, _centerY)}
          transform={bellRotation}
        />}
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 7 * width / 11,
    right: 0,
    bottom: 0,
  },
});