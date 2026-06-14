import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { ProgressPanel } from "@/components/ui/ProgressPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CategoryPicker } from "@/features/wardrobe/components/CategoryPicker";
import { SelectedPhotoGrid } from "@/features/wardrobe/components/SelectedPhotoGrid";
import { UploadFeedback } from "@/features/wardrobe/components/UploadFeedback";
import { useWardrobeUpload } from "@/features/wardrobe/hooks/useWardrobeUpload";
import { colors } from "@/theme/colors";

const uploadIcon = {
  android: "upload",
  ios: "square.and.arrow.up",
  web: "upload",
} as const;

export function WardrobeUploadForm() {
  const wardrobeUpload = useWardrobeUpload();
  const progress =
    wardrobeUpload.progress.total === 0
      ? 0
      : wardrobeUpload.progress.completed / wardrobeUpload.progress.total;
  const progressLabel =
    wardrobeUpload.status === "saving"
      ? "Saving to wardrobe"
      : `Uploading ${wardrobeUpload.progress.completed} of ${wardrobeUpload.progress.total}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader kicker="Wardrobe" title="Add clothing photos" />

        <CategoryPicker
          disabled={wardrobeUpload.isBusy}
          onChange={wardrobeUpload.setCategory}
          value={wardrobeUpload.category}
        />

        <SelectedPhotoGrid
          assets={wardrobeUpload.selectedAssets}
          disabled={wardrobeUpload.isBusy}
          onClear={wardrobeUpload.clearAssets}
          onPick={wardrobeUpload.pickImages}
          onRemove={wardrobeUpload.removeAsset}
        />

        {wardrobeUpload.isBusy ? (
          <ProgressPanel label={progressLabel} progress={progress} />
        ) : null}

        <Button
          disabled={wardrobeUpload.isBusy}
          icon={uploadIcon}
          onPress={wardrobeUpload.upload}
          size="large"
        >
          {getUploadButtonLabel(wardrobeUpload.selectedAssets.length)}
        </Button>

        <UploadFeedback
          issue={wardrobeUpload.issue}
          onOpenSettings={wardrobeUpload.openSettings}
          onUploadRemaining={wardrobeUpload.upload}
          result={wardrobeUpload.result}
          status={wardrobeUpload.status}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getUploadButtonLabel(selectedCount: number) {
  if (selectedCount === 0) {
    return "Upload photos";
  }

  return selectedCount === 1
    ? "Upload 1 photo"
    : `Upload ${selectedCount} photos`;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface.app,
    flex: 1,
  },
  container: {
    backgroundColor: colors.surface.app,
    gap: 24,
    padding: 24,
    paddingBottom: 32,
  },
});
