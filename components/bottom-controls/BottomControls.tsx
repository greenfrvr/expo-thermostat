import { useTheme } from "@/hooks/useTheme";
import { Snowflake, Sun } from "lucide-react-native";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { ThemedText } from "../ThemedText";
import FanSlider from "./FanSlider";

type Props = {
  isEnabled: boolean;
  fanSpeed: number;
  mode: 'cool' | 'heat' | 'auto';
  setMode: (value: 'cool' | 'heat' | 'auto') => void;
  onFanValueChange: (value: number) => void;
}

const _colorDuration = 300;
const _indicatorDuration = 400;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableHighlight);

export default function BottomControls(props: Props) {
  const {
    isEnabled,
    fanSpeed,
    mode,
    setMode,
    onFanValueChange,
  } = props;

  const theme = useTheme();

  const coolButtonAnim = useAnimatedStyle(() => {
    const isActive = mode === 'cool';
    return {
      backgroundColor: withTiming(isActive ? theme.coolrBgColor : theme.buttonBgColor, { duration: _colorDuration }),
    };
  });

  const heatButtonAnim = useAnimatedStyle(() => {
    const isActive = mode === 'heat';
    return {
      backgroundColor: withTiming(isActive ? theme.heatBgColor : theme.buttonBgColor, { duration: _colorDuration }),
    };
  });

  const autoButtonAnim = useAnimatedStyle(() => {
    const isActive = mode === 'auto';
    return {
      backgroundColor: withTiming(isActive ? theme.autoBgColor : theme.buttonBgColor, { duration: _colorDuration }),
    };
  });

  const autoIndicatorAnim = useAnimatedStyle(() => {
    return {
      left: withTiming(mode === 'auto' ? 16 : 62, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      right: withTiming(mode === 'auto' ? 16 : 62, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      backgroundColor: withTiming(mode === 'auto' ? theme.autoColor : 'transparent', { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
    };
  });

  const coolIndicatorAnim = useAnimatedStyle(() => {
    return {
      left: withTiming(mode === 'cool' ? 16 : 31, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      right: withTiming(mode === 'cool' ? 16 : 31, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      backgroundColor: withTiming(mode === 'cool' ? theme.coolColor : 'transparent', { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
    };
  });

  const coolIconAnim = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(mode === 'cool' ? '90deg' : '0deg', { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }) }],
    };
  });

  const heatIconAnim = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(mode === 'heat' ? '90deg' : '0deg', { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }) }],
    };
  });

  const heatIndicatorAnim = useAnimatedStyle(() => {
    return {
      left: withTiming(mode === 'heat' ? 16 : 31, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      right: withTiming(mode === 'heat' ? 16 : 31, { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
      backgroundColor: withTiming(mode === 'heat' ? theme.heatColor : 'transparent', { duration: _indicatorDuration, easing: Easing.bezier(0.25, 0.55, 0.25, 1.02) }),
    };
  });

  return (
    <View>
      <View style={styles.controlsContainer}>
        <AnimatedTouchableOpacity
          style={[styles.autoButton, autoButtonAnim]}
          onPress={() => setMode('auto')}
        >
          <View style={styles.autoButtonContent}>
            <ThemedText style={[styles.autoText, mode === 'auto' && { color: theme.autoColor }]}>Auto</ThemedText>
            <View style={[styles.autoIcon, mode === 'auto' && { borderColor: theme.autoColor }]}>
              <ThemedText style={[styles.autoIconText, mode === 'auto' && { color: theme.autoColor }]}>A</ThemedText>
            </View>
            <Animated.View style={[styles.activeIindicator, autoIndicatorAnim]} />
          </View>
        </AnimatedTouchableOpacity>

        {/* Cool/Heat Toggle */}
        <View style={styles.modeToggle}>
          <AnimatedTouchableOpacity
            style={[styles.modeButton, coolButtonAnim]}
            onPress={() => setMode('cool')}
          >
            <View style={styles.buttonContent}>
              <Animated.View style={coolIconAnim}>
                <Snowflake size={24} color={mode === 'cool' ? theme.coolColor : theme.iconColor} />
              </Animated.View>
              <Animated.View style={[styles.activeIindicator, coolIndicatorAnim]} />
            </View>
          </AnimatedTouchableOpacity>

          <AnimatedTouchableOpacity
            style={[styles.modeButton, heatButtonAnim]}
            onPress={() => setMode('heat')}
          >
            <View style={styles.buttonContent}>
              <Animated.View style={heatIconAnim}>
                <Sun size={24} color={mode === 'heat' ? theme.heatColor : theme.iconColor} />
              </Animated.View>
              <Animated.View style={[styles.activeIindicator, heatIndicatorAnim]} />
            </View>
          </AnimatedTouchableOpacity>
        </View>
      </View>

      <FanSlider
        isEnabled={isEnabled}
        value={fanSpeed}
        min={0}
        max={100}
        mode={mode}
        onFanValueChange={onFanValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    gap: 4,
    marginBottom: 56,
  },
  autoButton: {
    width: 124,
    height: 60,
    borderRadius: 12,
    flexDirection: 'row',
  },
  autoButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activeIindicator: {
    position: 'absolute',
    height: 2.5,
    left: 16,
    right: 16,
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  autoText: {
    fontSize: 14,
    marginRight: 12,
    color: '#93999c',
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  autoIcon: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#93999c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoIconText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: 'SF-Pro-Rounded-Bold',
    color: '#93999c',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  modeButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});