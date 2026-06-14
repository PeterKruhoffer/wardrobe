import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type ScreenHeaderProps = {
  kicker: string;
  title: string;
};

export function ScreenHeader({ kicker, title }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  kicker: {
    color: colors.brand.primary,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "800",
  },
});
