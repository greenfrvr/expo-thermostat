import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";


function Component() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton}>
        <ArrowLeft color={'white'} />
      </TouchableOpacity>
    </View>
  );
}

const Header = React.memo(Component)

export default Header;

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