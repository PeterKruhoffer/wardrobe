import { useAction, useMutation } from "convex/react";
import { useCallback, useMemo, useReducer } from "react";
import { Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { api } from "@/convex/_generated/api";
import {
  getCanUpload,
  initialWardrobeUploadState,
  isWardrobeUploadBusy,
  wardrobeUploadReducer,
} from "@/features/wardrobe/hooks/wardrobeUploadReducer";
import { pickWardrobeImages } from "@/features/wardrobe/lib/imagePicker";
import {
  uploadWardrobeAsset,
  uploadWardrobeAssets,
} from "@/features/wardrobe/lib/storageUpload";
import {
  categoryRequiredIssue,
  missingPhotosIssue,
  noFilesUploadedIssue,
  partialUploadIssue,
  photoAccessIssue,
  pickerFailedIssue,
  saveFailedIssue,
  selectionFullIssue,
  selectionLimitedIssue,
} from "@/features/wardrobe/lib/uploadIssues";
import { MAX_PHOTOS_PER_UPLOAD } from "@/features/wardrobe/types";
import type {
  WardrobeCategory,
  WardrobeUploadAsset,
} from "@/features/wardrobe/types";

export function useWardrobeUpload() {
  const generateUploadUrl = useMutation(api.wardrobeItems.generateUploadUrl);
  const saveUploadedImages = useAction(api.wardrobeItems.saveUploadedImages);
  const [, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [state, dispatch] = useReducer(
    wardrobeUploadReducer,
    initialWardrobeUploadState,
  );

  const isBusy = isWardrobeUploadBusy(state.status);
  const canUpload = getCanUpload(state);

  const pickImages = useCallback(async () => {
    if (isBusy) {
      return;
    }

    dispatch({ type: "pickingStarted" });

    try {
      const pickerResult = await pickWardrobeImages({
        requestPermission: requestMediaLibraryPermission,
        selectedCount: state.selectedAssets.length,
      });

      applyPickerResult(pickerResult);
    } catch (error) {
      dispatch({
        type: "uploadFailed",
        issue: pickerFailedIssue(error),
      });
    }
  }, [isBusy, requestMediaLibraryPermission, state.selectedAssets.length]);

  const uploadOneAsset = useCallback(
    (asset: WardrobeUploadAsset) =>
      uploadWardrobeAsset({ asset, generateUploadUrl }),
    [generateUploadUrl],
  );

  const upload = useCallback(async () => {
    if (isBusy) {
      return;
    }

    const uploadCategory = state.category;

    if (uploadCategory === null) {
      dispatch({ type: "uploadBlocked", issue: categoryRequiredIssue() });
      return;
    }

    if (state.selectedAssets.length === 0) {
      dispatch({ type: "uploadBlocked", issue: missingPhotosIssue() });
      return;
    }

    const assetsToUpload = state.selectedAssets.slice(0, MAX_PHOTOS_PER_UPLOAD);

    dispatch({ type: "uploadStarted", total: assetsToUpload.length });

    const { failures, uploadedFiles } = await uploadWardrobeAssets({
      assets: assetsToUpload,
      onProgress: (completed) =>
        dispatch({ type: "uploadProgressed", completed }),
      uploadAsset: uploadOneAsset,
    });

    if (uploadedFiles.length === 0) {
      dispatch({
        type: "uploadFailed",
        issue: noFilesUploadedIssue(failures[0]?.message),
      });
      return;
    }

    dispatch({ type: "saveStarted" });

    try {
      const savedItems = await saveUploadedImages({
        category: uploadCategory,
        files: uploadedFiles,
      });
      const result = {
        category: uploadCategory,
        failedCount: failures.length,
        savedCount: savedItems.length,
      };

      if (failures.length > 0) {
        dispatch({
          type: "uploadPartiallySucceeded",
          issue: partialUploadIssue(failures[0]?.message),
          remainingAssets: failures.map((failure) => failure.asset),
          result,
        });
        return;
      }

      dispatch({ type: "uploadSucceeded", result });
    } catch (error) {
      dispatch({
        type: "saveFailed",
        issue: saveFailedIssue(error),
      });
    }
  }, [
    isBusy,
    saveUploadedImages,
    state.category,
    state.selectedAssets,
    uploadOneAsset,
  ]);

  const clearAssets = useCallback(() => {
    dispatch({ type: "assetsCleared" });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: "feedbackCleared" });
  }, []);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    dispatch({ type: "assetRemoved", assetId });
  }, []);

  const setCategory = useCallback((category: WardrobeCategory) => {
    dispatch({ type: "categorySelected", category });
  }, []);

  return useMemo(
    () => ({
      canUpload,
      category: state.category,
      clearAssets,
      clearFeedback,
      isBusy,
      issue: state.issue,
      openSettings,
      pickImages,
      progress: state.progress,
      removeAsset,
      result: state.result,
      selectedAssets: state.selectedAssets,
      setCategory,
      status: state.status,
      upload,
    }),
    [
      canUpload,
      clearAssets,
      clearFeedback,
      isBusy,
      openSettings,
      pickImages,
      removeAsset,
      setCategory,
      state,
      upload,
    ],
  );

  function applyPickerResult(
    pickerResult: Awaited<ReturnType<typeof pickWardrobeImages>>,
  ) {
    switch (pickerResult.kind) {
      case "canceled":
        dispatch({ type: "pickingCanceled" });
        return;
      case "permissionDenied":
        dispatch({
          type: "uploadFailed",
          issue: photoAccessIssue({ canAskAgain: pickerResult.canAskAgain }),
        });
        return;
      case "selectionFull":
        dispatch({
          type: "uploadFailed",
          issue: selectionFullIssue(),
        });
        return;
      case "selected":
        dispatch({
          type: "assetsAdded",
          assets: pickerResult.assets,
          issue: pickerResult.wasLimited ? selectionLimitedIssue() : undefined,
        });
    }
  }
}
