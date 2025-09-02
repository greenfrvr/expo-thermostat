import { useTheme } from "@/hooks/useTheme";
import * as Haptics from 'expo-haptics';
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

const _propellerIcon = require('@/assets/icons/propeller.png');
const _colorDuration = 300;
const _hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

type Props = {
  isEnabled: boolean;
  value: number;
  min: number;
  max: number;
  mode: 'auto' | 'cool' | 'heat';
  onFanValueChange?: (value: number) => void;
}

export default function FanSlider(props: Props) {
  const {
    isEnabled,
    value = 0,
    min = 0,
    max = 100,
    mode,
    onFanValueChange
  } = props;

  const theme = useTheme();

  const sliderValue = useSharedValue(0);
  const translateX = useSharedValue(0);
  const lastTranslationX = useSharedValue(0);

  const movingDirection = useSharedValue<'left' | 'right' | 'idle'>('idle');

  useEffect(() => {
    const normalizedValue = (value - min) / (max - min);
    translateX.value = withTiming(normalizedValue * sliderValue.value, { duration: 300 }, (finished) => {
      if (finished) {
        movingDirection.value = 'idle';
      }
    });

    if (value > 0) {
      movingDirection.value = 'right';
    } else {
      movingDirection.value = 'left';
    }
  }, [value, min, max, sliderValue, translateX, movingDirection]);


  const handleUpdate = (value: number, sliderValue: number) => {
    const actualValue = value / sliderValue * (max - min) + min;
    onFanValueChange?.(actualValue);
  }

  const handleBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      if (sliderValue.value < 0 || !isEnabled) return;

      lastTranslationX.value = translateX.value;
      runOnJS(handleBegin)();
    })
    .onUpdate((event) => {
      if (sliderValue.value <= 0 || !isEnabled) return;
      const value = event.translationX;

      if (lastTranslationX.value + value < 0) {
        translateX.value = 0;
      } else if (lastTranslationX.value + value > sliderValue.value) {
        translateX.value = sliderValue.value;
      } else {
        translateX.value = lastTranslationX.value + value;
      }

      movingDirection.value = value < 0 ? 'left' : value > 0 ? 'right' : 'idle';
    })
    .onEnd((event) => {
      movingDirection.value = 'idle';
      runOnJS(handleUpdate)(translateX.value, sliderValue.value);
    })

  const trackAnim = useAnimatedStyle(() => {
    return {
      width: interpolate(translateX.value, [0, sliderValue.value], [0, sliderValue.value]),
    };
  });

  const sliderColorAnim = useAnimatedStyle(() => {
    const sliderColor = mode === 'cool' ? theme.coolColor : mode === 'heat' ? theme.heatColor : theme.autoColor;
    return {
      backgroundColor: withTiming(sliderColor, { duration: _colorDuration }),
      height: withSequence(withSpring(4, { duration: 250 }), withSpring(3, { duration: 250 })),
    };
  });

  const sliderThumbAnim = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: withTiming(isEnabled ? 0 : 10, { duration: _colorDuration }) }
      ],
      width: withTiming(isEnabled ? 20 : 0, { duration: _colorDuration }),
      height: withTiming(isEnabled ? 20 : 0, { duration: _colorDuration }),
    };
  });

  const leftIconAnim = useAnimatedStyle(() => {
    if (movingDirection.value !== 'left') {
      return {
        transform: [{ rotate: '0deg' }],
      }
    }

    return {
      transform: [{ rotate: withTiming(movingDirection.value === 'left' ? '180deg' : '0deg', { duration: _colorDuration }) }],
    };
  });

  const rightIconAnim = useAnimatedStyle(() => {
    if (movingDirection.value !== 'right') {
      return {
        transform: [{ rotate: '0deg' }],
      }
    }

    return {
      transform: [{ rotate: withTiming(movingDirection.value === 'right' ? '180deg' : '0deg', { duration: _colorDuration }) }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Image source={_propellerIcon} style={[styles.leftIcon, leftIconAnim]} />

      <View
        style={styles.slider}
        onLayout={(event) => sliderValue.value = event.nativeEvent.layout.width}>
        <Animated.View style={[styles.sliderTrack, sliderColorAnim, trackAnim]} />

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sliderThumb, sliderThumbAnim]} hitSlop={_hitSlop} />
        </GestureDetector>
      </View>

      <Animated.Image source={_propellerIcon} style={[styles.rightIcon, rightIconAnim]} />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#1d1d1d',
    borderRadius: 12,
  },
  leftIcon: {
    width: 12,
    height: 12,
    tintColor: '#93999c',
  },
  rightIcon: {
    width: 16,
    height: 16,
    tintColor: '#93999c',
  },
  slider: {
    flex: 1,
    height: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    width: '60%',
    height: 3,
    backgroundColor: '#00BFFF',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    left: -18,
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    top: -16,
    margin: 8,
  },
});