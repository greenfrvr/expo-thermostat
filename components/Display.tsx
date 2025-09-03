import { Droplets } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import AnimateableText from 'react-native-animateable-text';
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle, withDelay, withTiming } from "react-native-reanimated";

type Props = {
  isEnabled: boolean;
  temperature: SharedValue<number>;
  humidity: number;
}

const _temperatureColor = '#b5b5b5';
const _humidityColor = '#b5b5b5';

function Component(props: Props) {
  const {
    isEnabled,
    temperature,
    humidity,
  } = props;

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(isEnabled ? 0 : 300, withTiming(isEnabled ? 1 : 0.5, { duration: 300 })),
    };
  }, [isEnabled]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: temperature.value.toString(),
    };
  });

  return (
    <Animated.View style={[styles.container, opacityStyle]}>
      <Animated.Text style={styles.unitText}>°F</Animated.Text>

      <AnimateableText
        animatedProps={animatedProps}
        style={styles.temperature}
      />

      <View style={styles.humidityContainer}>
        <Droplets size={16} color={_humidityColor} />
        <Animated.Text style={styles.humidityText}>
          {humidity}%
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const Display = React.memo(Component)

export default Display;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    top: 0,
    left: 20,
    right: 120,
    bottom: 0,
    flex: 1,
  },
  unitText: {
    fontSize: 18,
    color: _temperatureColor,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    marginBottom: 4,
  },
  temperature: {
    fontFamily: 'SF-Pro-Rounded-Bold',
    color: '#f5f5f5',
    fontSize: 90,
    lineHeight: 88,
  },
  humidityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -12,
  },
  humidityText: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    color: _humidityColor,
    marginTop: 2,
  },
});