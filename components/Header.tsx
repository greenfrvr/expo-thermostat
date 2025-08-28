import { ArrowLeft } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <ArrowLeft color={'white'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
})