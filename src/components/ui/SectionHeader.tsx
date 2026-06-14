import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { colors } from "@/theme/colors";

type SectionHeaderProps = {
  action?: ReactNode;
  label: string;
  meta?: string;
};

export function SectionHeader({ action, label, meta }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>{label}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: colors.text.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },
});
