import type { SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Button, LinkButton } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  getCategoryLabel,
  type WardrobeUploadIssue,
  type WardrobeUploadResult,
  type WardrobeUploadStatus,
} from "@/features/wardrobe/types";
import { colors } from "@/theme/colors";

const wardrobeIcon = {
  android: "checkroom",
  ios: "hanger",
  web: "checkroom",
} satisfies SymbolViewProps["name"];

const settingsIcon = {
  android: "settings",
  ios: "gearshape",
  web: "settings",
} satisfies SymbolViewProps["name"];

const retryIcon = {
  android: "upload",
  ios: "arrow.clockwise",
  web: "upload",
} satisfies SymbolViewProps["name"];

type UploadFeedbackProps = {
  issue: WardrobeUploadIssue | null;
  onOpenSettings: () => void;
  onUploadRemaining: () => void;
  result: WardrobeUploadResult | null;
  status: WardrobeUploadStatus;
};

export function UploadFeedback({
  issue,
  onOpenSettings,
  onUploadRemaining,
  result,
  status,
}: UploadFeedbackProps) {
  if (result === null && issue === null) {
    return null;
  }

  const success = status === "success";
  const partial = status === "partial";
  const tone = success ? "success" : partial ? "warning" : "error";

  return (
    <Panel accessibilityRole="alert" tone={tone}>
      {result !== null ? (
        <UploadResultMessage partial={partial} result={result} />
      ) : null}

      {issue !== null ? (
        <UploadIssueMessage issue={issue} />
      ) : null}

      <UploadFeedbackActions
        issue={issue}
        onOpenSettings={onOpenSettings}
        onUploadRemaining={onUploadRemaining}
        showWardrobeLink={result !== null}
      />
    </Panel>
  );
}

function UploadResultMessage({
  partial,
  result,
}: {
  partial: boolean;
  result: WardrobeUploadResult;
}) {
  return (
    <FeedbackMessage
      body={`${formatSavedMessage(result.savedCount)} saved to ${getCategoryLabel(
        result.category,
      ).toLowerCase()}.${result.failedCount > 0 ? ` ${result.failedCount} still selected.` : ""}`}
      title={partial ? "Some photos uploaded" : "Upload complete"}
    />
  );
}

function UploadIssueMessage({ issue }: { issue: WardrobeUploadIssue }) {
  return (
    <FeedbackMessage body={issue.message} detail={issue.detail} title={issue.title} />
  );
}

function FeedbackMessage({
  body,
  detail,
  title,
}: {
  body: string;
  detail?: string;
  title: string;
}) {
  return (
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{body}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

function UploadFeedbackActions({
  issue,
  onOpenSettings,
  onUploadRemaining,
  showWardrobeLink,
}: {
  issue: WardrobeUploadIssue | null;
  onOpenSettings: () => void;
  onUploadRemaining: () => void;
  showWardrobeLink: boolean;
}) {
  if (!showWardrobeLink && issue?.action !== "openSettings" && issue?.action !== "uploadRemaining") {
    return null;
  }

  return (
    <View style={styles.actions}>
      {showWardrobeLink ? (
        <LinkButton href="/wardrobe" icon={wardrobeIcon}>
          Open wardrobe
        </LinkButton>
      ) : null}

      {issue?.action === "openSettings" ? (
        <Button
          icon={settingsIcon}
          onPress={onOpenSettings}
          variant="outline"
        >
          Open Settings
        </Button>
      ) : null}

      {issue?.action === "uploadRemaining" ? (
        <Button
          icon={retryIcon}
          onPress={onUploadRemaining}
          variant="outline"
        >
          Upload remaining
        </Button>
      ) : null}
    </View>
  );
}

function formatSavedMessage(count: number) {
  return count === 1 ? "1 photo" : `${count} photos`;
}

const styles = StyleSheet.create({
  copy: {
    gap: 6,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    color: colors.text.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
