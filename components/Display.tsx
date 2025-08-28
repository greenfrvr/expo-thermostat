import { Droplets } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

type Props = {
  isEnabled: boolean;
  temperature: number;
  humidity: number;
}

const _temperatureColor = '#b5b5b5';
const _humidityColor = '#b5b5b5'  ;

export default function Display(props: Props) {
  const {
    isEnabled,
    temperature,
    humidity,
  } = props;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.unitText} lightColor={_temperatureColor}>°F</ThemedText>

      <ThemedText style={styles.temperature}>
        {temperature}
      </ThemedText>

      {/* Humidity */}
      <View style={styles.humidityContainer}>
        <Droplets size={16} color={_humidityColor} />
        <ThemedText style={styles.humidityText} lightColor={_humidityColor}>
          {humidity}%
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    top: 0,
    left: 20,
    bottom: 0,
    flex: 1,
  },
  unitText: {
    fontSize: 18,
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
    gap: 4,
    marginTop: -12,
  },
  humidityText: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Rounded-Semibold',
  },
});