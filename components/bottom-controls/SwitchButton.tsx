import { useTheme } from "@/hooks/useTheme";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
  icon: LucideIcon;
  color: string;
  backgroundColor: string;
  isEnabled: boolean;
  isActive: boolean;
  onPress: () => void;
}

const _colorDuration = 300;
const _indicatorDuration = 400;
const _horizontalMargin = 16;
const _hideMargin = _horizontalMargin * 2;
const _easing = Easing.bezier(0.25, 0.55, 0.25, 1.02);
const _animOptions = { duration: _indicatorDuration, easing: _easing };


export default function SwitchButton(props: Props) {
  const {
    icon: Icon,
    color,
    backgroundColor,
    isEnabled,
    isActive,
    onPress,
  } = props;

  const theme = useTheme();

  const buttonAnim = useAnimatedStyle(() => {
    const color = isEnabled && isActive ? backgroundColor : theme.buttonBgColor;
    return {
      backgroundColor: withTiming(color, { duration: _colorDuration }),
    };
  }, [isEnabled, isActive]);

  const iconContainerAnim = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(isActive ? '90deg' : '0deg', _animOptions) }],
    };
  }, [isActive]);

  const indicatorAnim = useAnimatedStyle(() => {
    const margin = isActive ? _horizontalMargin : _hideMargin;
    return {
      left: withTiming(margin, _animOptions),
      right: withTiming(margin, _animOptions),
      backgroundColor: withTiming(isActive && isEnabled ? color : 'transparent', _animOptions),
    };
  }, [isActive, isEnabled]);

  return (
    <AnimatedTouchableOpacity
      style={[styles.modeButton, buttonAnim]}
      onPress={onPress}
      disabled={!isEnabled}
      activeOpacity={0.75}
    >
      <View style={styles.buttonContent}>

        <Animated.View style={iconContainerAnim}>
          <Icon size={24} color={isActive && isEnabled ? color : theme.iconColor} />
        </Animated.View>
        <Animated.View style={[styles.activeIindicator, indicatorAnim]} />
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  },
  activeIindicator: {
    position: 'absolute',
    height: 3,
    left: _horizontalMargin,
    right: _horizontalMargin,
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});