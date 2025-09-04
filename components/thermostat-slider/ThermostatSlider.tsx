import { RoomPallets } from '@/constants/Colors';
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
import { Easing, interpolateColor, SharedValue, useDerivedValue, useSharedValue, withDecay, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { MaskBubble } from './MaskBubble';
import { CONFIG } from './config';
import { createBellTicksPath, createUnitsPath, createUnitsPath2, ringSegmentPath } from './utils';

const { width, height } = Dimensions.get('window');

const _strokeWidth = 40;
const _minTemperature = 62; //min temperature for the slider
const _maxTemperature = 86; //max temperature for the slider
const _tempDelta = _maxTemperature - _minTemperature; //delta temperature for the slider
const _minThreshold = -0.85; //min angle for the slider
const _maxThreshold = 1.85; //max angle for the slider
const _thresholdDelta = _maxThreshold - _minThreshold;
const _radius = width * 0.9; //radius of the circle
const _easing = Easing.bezier(0.25, 0.1, 0.25, 1);


interface ThermostatGradientCircleProps {
  isEnabled: boolean;
  room: number;
  temperature: SharedValue<number>;
  style?: any;
}

export const ThermostatGradientCircle = (props: ThermostatGradientCircleProps) => {
  const {
    isEnabled,
    room,
    temperature,
    style
  } = props;

  const theme = useTheme();

  const { centerX, centerY } = CONFIG;

  const lastAngle = useSharedValue(0);

  const bellExpandAnim = useSharedValue(0);
  const bellRotateAnim = useSharedValue(-1);

  const fromRoom = useSharedValue(room);
  const toRoom = useSharedValue(room);
  const gradTransitionAnim = useSharedValue(1);
  const gradAppearAnim = useSharedValue(0);

  useEffect(() => {
    gradAppearAnim.value = withTiming(isEnabled ? 1 : 0, { duration: isEnabled ? 3000 : 700, easing: Easing.linear });
    bellRotateAnim.value = isEnabled
      ? withTiming(0, { duration: 1100, easing: _easing })
      : withDelay(400, withTiming(-1, { duration: 700, easing: _easing }));
  }, [isEnabled, gradAppearAnim, bellRotateAnim]);

  useEffect(() => {
    if (room === toRoom.value) {
      return;
    }

    fromRoom.value = toRoom.value;
    toRoom.value = room;

    gradTransitionAnim.value = 0;
    gradTransitionAnim.value = withTiming(1, { duration: 350, easing: Easing.linear });
    bellExpandAnim.value = withSequence(withTiming(1, { duration: 250, easing: _easing }), withTiming(0, { duration: 250, easing: _easing }));
  }, [room, fromRoom, toRoom, gradTransitionAnim, bellExpandAnim]);

  const clamp = (x: number, a: number, b: number) => {
    'worklet';
    return Math.max(a, Math.min(b, x));
  };
  const tempToRot = (temp: number) => {
    'worklet';
    return _minThreshold + (1 - (temp - _minTemperature) / _tempDelta) * _thresholdDelta;
  };
  const rotToTemp = (rot: number) => {
    'worklet';
    return _minTemperature + (1 - (rot - _minThreshold) / _thresholdDelta) * _tempDelta;
  };
  // derivative for velocity mapping
  const dTemp_dRot = -_tempDelta / _thresholdDelta;

  const gesture = Gesture.Pan()
    .onBegin(({ absoluteX, absoluteY }) => {
      lastAngle.value = Math.atan2(-(absoluteY - centerY), (absoluteX - centerX));
      bellExpandAnim.value = withTiming(1, { duration: 200, easing: _easing });
    })
    .onUpdate(({ absoluteX, absoluteY }) => {
      const a = Math.atan2(-(absoluteY - centerY), (absoluteX - centerX));
      const delta = Math.atan2(Math.sin(a - lastAngle.value), Math.cos(a - lastAngle.value));
      const newRot = clamp(tempToRot(temperature.value) - delta, _minThreshold, _maxThreshold);

      temperature.value = clamp(rotToTemp(newRot), _minTemperature, _maxTemperature);
      lastAngle.value = a;
    })
    .onEnd(({ absoluteX, absoluteY, velocityX, velocityY }) => {
      const rx = absoluteX - centerX, ry = -(absoluteY - centerY);
      const r2 = rx * rx + ry * ry;
      if (r2 > 1) {
        const vx = velocityX, vy = -velocityY;
        const omega = (rx * vy - ry * vx) / r2; // rad/s (positive CW)
        // map angular velocity → temperature velocity
        const tempVel = (-dTemp_dRot) * omega;  // sign: test; flip if it feels reversed
        temperature.value = withDecay({
          velocity: tempVel,
          deceleration: 0.995,
          clamp: [_minTemperature, _maxTemperature],
        });
      }
      bellExpandAnim.value = withTiming(0, { duration: 200, easing: _easing });
    })
    .enabled(isEnabled);

  const bellTicks = useMemo(() => createBellTicksPath(CONFIG.bellTicksParams), []);
  const bellTicksExpanded = useMemo(() => createBellTicksPath(CONFIG.bellTicksExpandedParams), []);
  const ticks = useMemo(() => createUnitsPath(CONFIG.ticksCommonParams), []);
  const overlayTicks = useMemo(() => createUnitsPath2(CONFIG.ticksCommonParams), []);
  const ringSegmentArc = useMemo(() => ringSegmentPath(centerX, centerY, _radius, _radius, Math.PI / 2, Math.PI * 3 / 2), []);

  const bellPath = usePathInterpolation(bellExpandAnim, [0, 1], [bellTicks, bellTicksExpanded]);

  const rotationSV = useDerivedValue(() => tempToRot(temperature.value));
  const rotateProp = useDerivedValue(() => [{ rotate: rotationSV.value * 0.5 }]);
  const bellRotation = useDerivedValue(() => [{ rotate: bellRotateAnim.value }]);

  const circleColor = useDerivedValue(() => {
    return withDelay(isEnabled ? 0 : 300, withTiming(isEnabled ? '#525956' : theme.buttonBgColor, { duration: 400 }));
  }, [isEnabled]);

  const colors = useDerivedValue(() => {
    const fromPallet = RoomPallets[fromRoom.value];
    const toPallet = RoomPallets[toRoom.value];

    return [0, 1, 2, 3, 4].map((row) =>
      interpolateColor(gradTransitionAnim.value, [0, 1], [fromPallet[row], toPallet[row]])
    );
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={[styles.container, { width, height }, style]}>
        <Circle
          cx={centerX}
          cy={centerY}
          r={_radius}
          style="stroke"
          strokeWidth={_strokeWidth}
          color={theme.buttonBgColor}
        />

        <Mask mask={<Circle
          cx={centerX}
          cy={centerY}
          r={_radius}
          style="stroke"
          strokeWidth={_strokeWidth}
          color={'whie'}
        />}>
          <Group>
            {CONFIG.bubblesConfig.map((bubble, index) => (
              <MaskBubble
                key={index}
                {...bubble}
                center={centerX}
                centerY={centerY}
                radius={_radius}
                isEnabled={isEnabled}
              >
                <SweepGradient
                  c={vec(centerX, centerY)}
                  colors={colors}
                  transform={rotateProp}
                  origin={vec(centerX, centerY)}
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
          end={gradAppearAnim} // -> 1
        >
          <SweepGradient
            c={vec(centerX, centerY)}
            colors={colors}
            origin={vec(centerX, centerY)}
            transform={rotateProp}
          />
        </Path>

        <Group
          origin={vec(centerX, centerY)}
          transform={rotateProp}
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
          origin={vec(centerX, centerY)}
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