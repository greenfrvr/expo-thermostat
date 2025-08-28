import {
  Canvas,
  Circle,
  Group,
  Path,
  SweepGradient,
  usePathInterpolation,
  vec
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Easing, runOnJS, useDerivedValue, useSharedValue, withDecay, withSequence, withTiming } from 'react-native-reanimated';
import { createBellTicksPath, createUnitsPath, createUnitsPath2 } from './utils';

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

interface ThermostatGradientCircleProps {
  isEnabled: boolean;
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  style?: any;
}

export const ThermostatGradientCircle = (props: ThermostatGradientCircleProps) => {
  const {
    isEnabled,
    temperature,
    onTemperatureChange,
    style
  } = props;

  const rotation = useSharedValue(0.3);
  const lastAngle = useSharedValue(0.3);

  const bellAnim = useSharedValue(0);
  const bellStartAnim = useSharedValue(1);

  useEffect(() => {
    bellAnim.value = withSequence(withTiming(1, { duration: 550, easing: Easing.bezier(0.25, 0.1, 0.25, 1.37) }), withTiming(0, { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    bellStartAnim.value = withTiming(0, { duration: 550, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
  }, []);

  const gesture = Gesture.Pan()
    .onBegin(({ absoluteX, absoluteY }) => {
      if (lastAngle.value !== 0) {
        lastAngle.value = Math.atan2(-(absoluteY - _centerY), (absoluteX - _center));
      }
      bellAnim.value = withTiming(1, { duration: 200 });
    })
    .onUpdate(({ absoluteX, absoluteY }) => {
      const a = Math.atan2(-(absoluteY - _centerY), (absoluteX - _center));
      const raw = a - lastAngle.value;
      const delta = Math.atan2(Math.sin(raw), Math.cos(raw));
      const newRotation = rotation.value - delta;

      if (newRotation > _minThreshold && newRotation < _maxThreshold) {
        rotation.value = newRotation;
        lastAngle.value = a;
      } else if (newRotation < _minThreshold) {
        rotation.value = _minThreshold;
      } else if (newRotation > _maxThreshold) {
        rotation.value = _maxThreshold;
      }

      const newTempValue = (1 - (rotation.value - _minThreshold) / _thresholdDelta) * _tempDelta + _minTemperature;
      runOnJS(onTemperatureChange)(Math.round(newTempValue));
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
    });

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

  const bellPath = usePathInterpolation(bellAnim, [0, 1], [bellTicks, bellTicksExpanded]);

  const rotateProp = useDerivedValue(() => [{ rotate: rotation.value * 0.8 }]);
  const rotateDecay = useDerivedValue(() => [{ rotate: rotation.value * 0.8 }]);
  const bellRotation = useDerivedValue(() => [{ rotate: bellStartAnim.value }]);

  useDerivedValue(() => {
    const t = (1 - (rotation.value - _minThreshold) / _thresholdDelta) * _tempDelta + _minTemperature;
    runOnJS(onTemperatureChange)(Math.round(t));
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={[styles.container, { width, height }, style]}>
        <Circle
          cx={_center}
          cy={_centerY}
          r={_radius}
          style="stroke"
          strokeWidth={_strokeWidth}
          strokeCap="round"
          origin={vec(_center, _centerY)}
          transform={rotateProp}
        >
          <SweepGradient
            c={vec(_center, _centerY)}
            colors={_gradientColors}
          />
        </Circle>

        <Group
          origin={vec(_center, _centerY)}
          transform={rotateDecay}
        >
          {ticks && <Path
            path={ticks}
            style="stroke"
            strokeWidth={2}
            opacity={0.75}
            color={'gray'}
          />}

          {overlayTicks && <Path
            path={overlayTicks}
            style="stroke"
            strokeWidth={2}
            opacity={0.35}
            color={'gray'}
          />}
        </Group>

        {bellPath && <Path
          path={bellPath}
          style="stroke"
          strokeWidth={2}
          opacity={0.75}
          color="gray"
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
    left: width / 2 + 20,
    right: 0,
    bottom: 0,
  },
});