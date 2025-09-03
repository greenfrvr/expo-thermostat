import { Rooms } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { ChevronDown } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";


interface TopControlsProps {
  rooms?: string[];
  mode: 'cool' | 'heat' | 'auto';
  selectedRoom: number;
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
  onChangeRoom: (room: number) => void;
}

function Component({ mode, selectedRoom, isEnabled, setIsEnabled, onChangeRoom, rooms }: TopControlsProps) {
  const theme = useTheme();

  const [roomModalVisible, setRoomModalVisible] = useState(false);

  const availableRooms = useMemo(() => rooms ?? ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Kids Room'], [rooms]);

  const color = mode === 'cool' ? theme.coolColor : mode === 'heat' ? theme.heatColor : theme.autoColor;

  return (
    <View style={styles.container}>
      <View style={styles.roomSelector} >
        <TouchableOpacity style={styles.roomButton} activeOpacity={0.8} onPress={() => setRoomModalVisible(true)}>
          <ThemedText style={styles.roomText} lightColor="#FFFFFF">
            {Rooms[selectedRoom]}
          </ThemedText>
          <ChevronDown size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View >

      <View style={styles.powerToggle} >
        <Switch
          value={isEnabled}
          onValueChange={setIsEnabled}
          trackColor={{ false: '#3E3E3E', true: color }}
          thumbColor={isEnabled ? '#FFFFFF' : '#f4f3f4'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View >

      <Modal
        visible={roomModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setRoomModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => { /* swallow */ }}>
            {availableRooms.map((room, index) => {
              const isActive = index === selectedRoom;
              return (
                <Pressable
                  key={room}
                  style={[styles.roomItem, isActive && { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                  onPress={() => {
                    onChangeRoom(index);
                    setRoomModalVisible(false);
                  }}
                >
                  <ThemedText style={[styles.roomItemText, isActive && { color: '#FFFFFF', fontWeight: '700' }]} lightColor="#FFFFFF">
                    {Rooms[index]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const TopControls = React.memo(Component)

export default TopControls;

const styles = StyleSheet.create({
  roomSelector: {
    minWidth: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  roomButton: {
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  powerToggle: {
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  container: {
    gap: 4,
    alignSelf: 'flex-start',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgb(20,20,20)',
    borderRadius: 12,
  },
  roomItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)'
  },
  roomItemText: {
    fontSize: 16,
  },
});