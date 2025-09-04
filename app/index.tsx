import BottomControls from '@/components/bottom-controls/BottomControls';
import Display from '@/components/Display';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { ThermostatGradientCircle } from '@/components/thermostat-slider/ThermostatSlider';
import TopControls from '@/components/TopControls';
import { Rooms } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export type Mode = 'cool' | 'heat' | 'auto';
export type RoomIndex = 0 | 1 | 2 | 3 | 4;

export default function ThermostatScreen() {
  const temperature = useSharedValue(76);

  const [fanSpeed, setFanSpeed] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomIndex>(0);
  const [mode, setMode] = useState<Mode>('cool');
  // per-room temperatures (displayed + restored on room switch)
  const [roomTemps, setRoomTemps] = useState<number[]>(() => Rooms.map(() => 76));

  // mirror current room and lock flag for UI thread to avoid canceling animations
  const currentRoomSV = useSharedValue<RoomIndex>(0 as RoomIndex);
  const switchingLockSV = useSharedValue(false);

  const insets = useSafeAreaInsets();

  const hapticeFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  // commit live temperature changes back into the current room slot (on JS thread)
  const commitTemp = (idx: number, t: number) => {
    setRoomTemps((prev) => {
      const next = prev.slice();
      next[idx] = t;
      return next;
    });
  };

  useAnimatedReaction(() => temperature.value, (value) => {
    if (switchingLockSV.value) {
      return; // ignore during room switch animation
    }

    runOnJS(hapticeFeedback)();
  });

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, [mode]);

  // when room changes → animate slider temperature to that room's stored value
  useEffect(() => {
    if (selectedRoom === currentRoomSV.value) {
      return;
    }

    //update temp value before switching to other room
    commitTemp(currentRoomSV.value, temperature.value);

    currentRoomSV.value = selectedRoom;
    switchingLockSV.value = true;
    const target = roomTemps[selectedRoom] ?? 76;

    temperature.value = withTiming(target, { duration: 220 }, (finished) => {
      'worklet';
      if (finished) {
        switchingLockSV.value = false;
      }
    });
  }, [selectedRoom, roomTemps, temperature, currentRoomSV, switchingLockSV]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
        <Header />

        <ThermostatGradientCircle
          room={selectedRoom}
          style={styles.thermostatContainer}
          temperature={temperature}
          isEnabled={isEnabled}
        />

        <Display
          isEnabled={isEnabled}
          temperature={temperature}
          humidity={56}
        />

        <View style={styles.content}>
          <TopControls
            rooms={Rooms}
            selectedRoom={selectedRoom}
            isEnabled={isEnabled}
            setIsEnabled={setIsEnabled}
            mode={mode}
            onChangeRoom={setSelectedRoom}
          />

          <BottomControls
            isEnabled={isEnabled}
            fanSpeed={fanSpeed}
            mode={mode}
            setMode={setMode}
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
