import { StyleSheet, View, type ViewProps } from "react-native";

import { colors } from "@/theme/colors";

type PanelTone = "neutral" | "success" | "warning" | "error";

type PanelProps = ViewProps & {
  tone?: PanelTone;
};

export function Panel({ style, tone = "neutral", ...viewProps }: PanelProps) {
  return <View style={[styles.base, styles[tone], style]} {...viewProps} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  neutral: {
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
  },
  success: {
    backgroundColor: colors.feedback.successSoft,
    borderColor: colors.feedback.success,
  },
  warning: {
    backgroundColor: colors.feedback.warningSoft,
    borderColor: colors.feedback.warning,
  },
  error: {
    backgroundColor: colors.feedback.errorSoft,
    borderColor: colors.feedback.error,
  },
});
