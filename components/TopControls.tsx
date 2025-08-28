import { useTheme } from "@/hooks/useTheme";
import { ChevronDown } from "lucide-react-native";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";


interface TopControlsProps {
  mode: 'cool' | 'heat' | 'auto';
  selectedRoom: string;
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
}

export default function TopControls({ mode, selectedRoom, isEnabled, setIsEnabled }: TopControlsProps) {
  const theme = useTheme();
  const color = mode === 'cool' ? theme.coolColor : mode === 'heat' ? theme.heatColor : theme.autoColor;

  return (
    <View style={styles.container}>
      <View style={styles.roomSelector} >
        <TouchableOpacity style={styles.roomButton} activeOpacity={0.8}>
          <ThemedText style={styles.roomText} lightColor="#FFFFFF">
            {selectedRoom}
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
    </View>
  );
}

const styles = StyleSheet.create({
  roomSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  roomButton: {
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
});