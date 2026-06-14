import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { colors } from "@/theme/colors";

type EmptyStateProps = {
  action?: ReactNode;
  body?: string;
  minHeight?: number;
  title: string;
};

export function EmptyState({
  action,
  body,
  minHeight = 108,
  title,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, { minHeight }]}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: 8,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: colors.text.muted,
    fontSize: 13,
    textAlign: "center",
  },
});
