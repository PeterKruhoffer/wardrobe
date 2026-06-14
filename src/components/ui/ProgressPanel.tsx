import { StyleSheet, Text, View } from "react-native";

import { Panel } from "@/components/ui/Panel";
import { colors } from "@/theme/colors";

type ProgressPanelProps = {
  label: string;
  progress: number;
};

export function ProgressPanel({ label, progress }: ProgressPanelProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressPercent = Math.round(clampedProgress * 100);

  return (
    <Panel style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{progressPercent}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(progressPercent, 8)}%` },
          ]}
        />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 10,
    padding: 14,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "700",
  },
  count: {
    color: colors.text.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  track: {
    backgroundColor: colors.border.subtle,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: colors.brand.primary,
    borderRadius: 999,
    height: "100%",
  },
});
