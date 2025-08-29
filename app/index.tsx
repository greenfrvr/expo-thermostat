import BottomControls from '@/components/bottom-controls/BottomControls';
import Display from '@/components/Display';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { ThermostatGradientCircle } from '@/components/thermostat-slider/ThermostatSlider';
import TopControls from '@/components/TopControls';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ThermostatScreen() {
  const [temperature, setTemperature] = useState(76);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [mode, setMode] = useState<'cool' | 'heat' | 'auto'>('cool');

  const insets = useSafeAreaInsets();

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }, [temperature]);

  useEffect(() => {
    if (isEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      setFanSpeed(33);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setFanSpeed(0);
    }
  }, [isEnabled]);

  useEffect(() => {
    setTimeout(() => {
      setFanSpeed(33);
    }, 300);
  }, []);

  useEffect(() => {
    console.log('fanSpeed', fanSpeed);
  }, [fanSpeed]);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, [mode]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <Header />

        <ThermostatGradientCircle
          isEnabled={isEnabled}
          style={styles.thermostatContainer}
          temperature={temperature}
          onTemperatureChange={setTemperature}
        />

        <Display
          isEnabled={isEnabled}
          temperature={temperature}
          humidity={56}
        />

        <View style={styles.content}>
          <TopControls
            selectedRoom={selectedRoom}
            isEnabled={isEnabled}
            setIsEnabled={setIsEnabled}
            mode={mode}
          />

          <BottomControls
            isEnabled={isEnabled}
            fanSpeed={fanSpeed}
            mode={mode}
            setMode={setMode}
            onFanValueChange={() => {}}
          />
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  thermostatContainer: {
    marginTop: 56,
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
});
