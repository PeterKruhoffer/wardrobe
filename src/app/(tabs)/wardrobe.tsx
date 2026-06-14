import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/colors";

export default function WardrobeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe</Text>
      <Text style={styles.description}>Wardrobe placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface.app,
    padding: 24,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    color: colors.text.secondary,
    fontSize: 16,
    textAlign: "center",
  },
});
