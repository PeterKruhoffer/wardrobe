import * as ImagePicker from "expo-image-picker";

import {
  MAX_PHOTOS_PER_UPLOAD,
  type WardrobeUploadAsset,
} from "@/features/wardrobe/types";

type PickWardrobeImagesArgs = {
  requestPermission: () => Promise<ImagePicker.MediaLibraryPermissionResponse>;
  selectedCount: number;
};

export type PickWardrobeImagesResult =
  | { kind: "canceled" }
  | { kind: "permissionDenied"; canAskAgain: boolean }
  | { kind: "selectionFull" }
  | {
      kind: "selected";
      assets: WardrobeUploadAsset[];
      wasLimited: boolean;
    };

export async function pickWardrobeImages({
  requestPermission,
  selectedCount,
}: PickWardrobeImagesArgs): Promise<PickWardrobeImagesResult> {
  const availableSlots = MAX_PHOTOS_PER_UPLOAD - selectedCount;

  if (availableSlots <= 0) {
    return { kind: "selectionFull" };
  }

  const permission = await requestPermission();

  if (!permission.granted) {
    return {
      kind: "permissionDenied",
      canAskAgain: permission.canAskAgain,
    };
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    allowsMultipleSelection: true,
    mediaTypes: ["images"],
    orderedSelection: true,
    quality: 1,
    selectionLimit: MAX_PHOTOS_PER_UPLOAD,
  });

  if (pickerResult.canceled) {
    return { kind: "canceled" };
  }

  return {
    kind: "selected",
    assets: pickerResult.assets
      .slice(0, availableSlots)
      .map(toUploadAsset),
    wasLimited: pickerResult.assets.length > availableSlots,
  };
}

function toUploadAsset(
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): WardrobeUploadAsset {
  const fileName = asset.fileName ?? getFileNameFromUri(asset.uri);

  return {
    id: [
      asset.assetId ?? asset.uri,
      fileName ?? "photo",
      asset.fileSize ?? "unknown-size",
      Date.now(),
      index,
    ].join("-"),
    uri: asset.uri,
    ...(fileName ? { fileName } : {}),
    ...(asset.mimeType ? { mimeType: asset.mimeType } : {}),
    ...(asset.fileSize ? { fileSize: asset.fileSize } : {}),
    width: asset.width,
    height: asset.height,
  };
}

function getFileNameFromUri(uri: string) {
  const fileName = uri.split("/").pop()?.split("?")[0];

  return fileName && fileName.includes(".")
    ? decodeURIComponent(fileName)
    : undefined;
}
