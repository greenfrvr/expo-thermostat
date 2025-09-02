import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { ThemedText } from "../ThemedText";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const _colorDuration = 300;
const _indicatorDuration = 400;
const _horizontalMargin = 16;
const _hideMargin = _horizontalMargin * 4;
const _easing = Easing.bezier(0.25, 0.55, 0.25, 1.02);

type Props = {
  isActive: boolean;
  isEnabled: boolean;
  onPress: () => void;
}

export default function AutoSwitch(props: Props) {
  const {
    isActive,
    isEnabled,
    onPress,
  } = props;

  const theme = useTheme();

  const buttonStyle = useAnimatedStyle(() => {
    let color = isEnabled && isActive ? theme.autoBgColor : theme.buttonBgColor;

    return {
      backgroundColor: withTiming(color, { duration: _colorDuration }),
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    const margin = isActive ? _horizontalMargin : _hideMargin;
    return {
      left: withTiming(margin, { duration: _indicatorDuration, easing: _easing }),
      right: withTiming(margin, { duration: _indicatorDuration, easing: _easing }),
      backgroundColor: withTiming(isActive ? theme.autoColor : 'transparent', { duration: _indicatorDuration, easing: _easing }),
    };
  });

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: withTiming(isActive ? '180deg' : '0deg', { duration: _indicatorDuration, easing: _easing }) }
      ]
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.autoButton, buttonStyle]}
      onPress={onPress}
      disabled={!isEnabled}
      activeOpacity={0.75}
    >
      <View style={styles.autoButtonContent}>
        <ThemedText style={[styles.autoText, isActive && { color: theme.autoColor }]}>Auto</ThemedText>

        <Animated.View style={[styles.autoIcon, isActive && { borderColor: theme.autoColor }, rotateStyle]}>
          <ThemedText style={[styles.autoIconText, isActive && { color: theme.autoColor }]}>A</ThemedText>
        </Animated.View>

        <Animated.View style={[styles.activeIindicator, indicatorStyle]} />
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  activeIindicator: {
    position: 'absolute',
    height: 3,
    left: 16,
    right: 16,
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});