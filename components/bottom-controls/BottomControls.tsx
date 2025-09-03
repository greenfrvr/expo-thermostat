import { useTheme } from "@/hooks/useTheme";
import { Snowflake, Sun } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withDelay, withTiming } from "react-native-reanimated";
import AutoSwitch from "./AutoSwitch";
import FanSlider from "./FanSlider";
import SwitchButton from "./SwitchButton";

type Props = {
  isEnabled: boolean;
  fanSpeed: number;
  mode: 'cool' | 'heat' | 'auto';
  setMode: (value: 'cool' | 'heat' | 'auto') => void;
  onFanValueChange?: (value: number) => void;
}

function Component(props: Props) {
  const {
    isEnabled,
    fanSpeed,
    mode,
    setMode,
    onFanValueChange,
  } = props;

  const theme = useTheme();

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(isEnabled ? 0 : 300, withTiming(isEnabled ? 1 : 0.75, { duration: 300 }))
    };
  }, [isEnabled]);

  return (
    <Animated.View
      style={opacityStyle}
      pointerEvents={'box-none'}>
      <View style={styles.controlsContainer}>

        <AutoSwitch
          isActive={mode === 'auto'}
          isEnabled={isEnabled}
          onPress={() => setMode('auto')}
        />

        <View style={styles.modeToggle}>
          <SwitchButton
            icon={Snowflake}
            color={theme.coolColor}
            backgroundColor={theme.coolBgColor}
            isEnabled={isEnabled}
            isActive={mode === 'cool'}
            onPress={() => setMode('cool')}
          />

          <SwitchButton
            icon={Sun}
            color={theme.heatColor}
            backgroundColor={theme.heatBgColor}
            isEnabled={isEnabled}
            isActive={mode === 'heat'}
            onPress={() => setMode('heat')}
          />
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
    </Animated.View>
  );
}

const BottomControls = React.memo(Component)

export default BottomControls;

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
    height: 3,
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