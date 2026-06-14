import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { stripImageMetadata } from "./lib/imageMetadata";
import { wardrobeCategoryValidator } from "./schema";

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;
const MAX_IMAGES_PER_UPLOAD = 20;

type WardrobeItemView = Doc<"wardrobeItems"> & {
  imageUrl: string | null;
};

const uploadedWardrobeImageValidator = v.object({
  storageId: v.id("_storage"),
  fileName: v.optional(v.string()),
});

const sanitizedWardrobeImageValidator = v.object({
  storageId: v.id("_storage"),
  fileName: v.optional(v.string()),
});

const wardrobeItemViewValidator = v.object({
  _id: v.id("wardrobeItems"),
  _creationTime: v.number(),
  storageId: v.id("_storage"),
  category: wardrobeCategoryValidator,
  fileName: v.optional(v.string()),
  contentType: v.optional(v.string()),
  size: v.number(),
  imageUrl: v.union(v.string(), v.null()),
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveUploadedImages = action({
  args: {
    category: wardrobeCategoryValidator,
    files: v.array(uploadedWardrobeImageValidator),
  },
  returns: v.array(wardrobeItemViewValidator),
  handler: async (ctx, args) => {
    const sanitizedFiles: Array<{ storageId: Id<"_storage">; fileName?: string }> =
      [];

    try {
      assertUploadBatch(args.files);

      for (const file of args.files) {
        const uploadedBlob = await ctx.storage.get(file.storageId);

        if (uploadedBlob === null) {
          throw new Error("Uploaded image was not found in storage.");
        }

        const sanitizedBlob = await stripImageMetadata(uploadedBlob);
        const sanitizedStorageId = await ctx.storage.store(sanitizedBlob);

        sanitizedFiles.push({
          storageId: sanitizedStorageId,
          ...(file.fileName ? { fileName: file.fileName } : {}),
        });

        await ctx.storage.delete(file.storageId);
      }

      const savedItems: WardrobeItemView[] = await ctx.runMutation(
        internal.wardrobeItems.insertSanitizedUploadedImages,
        {
          category: args.category,
          files: sanitizedFiles,
        },
      );

      return savedItems;
    } catch (error) {
      await cleanupStoredFiles(ctx, [
        ...args.files.map((file) => file.storageId),
        ...sanitizedFiles.map((file) => file.storageId),
      ]);
      throw error;
    }
  },
});

export const insertSanitizedUploadedImages = internalMutation({
  args: {
    category: wardrobeCategoryValidator,
    files: v.array(sanitizedWardrobeImageValidator),
  },
  returns: v.array(wardrobeItemViewValidator),
  handler: async (ctx, args) => {
    assertUploadBatch(args.files);

    const savedItems: WardrobeItemView[] = [];

    for (const file of args.files) {
      const metadata = await ctx.db.system.get("_storage", file.storageId);

      if (metadata === null) {
        throw new Error("Sanitized image was not found in storage.");
      }

      const existingItem = await ctx.db
        .query("wardrobeItems")
        .withIndex("by_storageId", (q) => q.eq("storageId", file.storageId))
        .unique();

      if (existingItem !== null) {
        savedItems.push({
          ...existingItem,
          imageUrl: await ctx.storage.getUrl(existingItem.storageId),
        });
        continue;
      }

      const wardrobeItemId = await ctx.db.insert("wardrobeItems", {
        storageId: file.storageId,
        category: args.category,
        ...(file.fileName ? { fileName: file.fileName } : {}),
        ...(metadata.contentType ? { contentType: metadata.contentType } : {}),
        size: metadata.size,
      });

      const wardrobeItem = await ctx.db.get(wardrobeItemId);

      if (wardrobeItem === null) {
        throw new Error("Failed to save uploaded image.");
      }

      savedItems.push({
        ...wardrobeItem,
        imageUrl: await ctx.storage.getUrl(wardrobeItem.storageId),
      });
    }

    return savedItems;
  },
});

export const list = query({
  args: {
    category: v.optional(wardrobeCategoryValidator),
    limit: v.optional(v.number()),
  },
  returns: v.array(wardrobeItemViewValidator),
  handler: async (ctx, args) => {
    const limit = getListLimit(args.limit);
    let items: Doc<"wardrobeItems">[];

    if (args.category === undefined) {
      items = await ctx.db.query("wardrobeItems").order("desc").take(limit);
    } else {
      const category = args.category;
      items = await ctx.db
        .query("wardrobeItems")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .take(limit);
    }

    return await Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.storageId),
      })),
    );
  },
});

function getListLimit(limit: number | undefined) {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_LIST_LIMIT;
  }

  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIST_LIMIT);
}

function assertUploadBatch(files: Array<{ storageId: string }>) {
  if (files.length === 0) {
    throw new Error("Upload at least one image.");
  }

  if (files.length > MAX_IMAGES_PER_UPLOAD) {
    throw new Error(`Upload ${MAX_IMAGES_PER_UPLOAD} images or fewer at once.`);
  }

  if (new Set(files.map((file) => file.storageId)).size !== files.length) {
    throw new Error("Upload each image only once.");
  }
}

async function cleanupStoredFiles(
  ctx: ActionCtx,
  storageIds: Array<Id<"_storage">>,
) {
  await Promise.allSettled(
    [...new Set(storageIds)].map((storageId) => ctx.storage.delete(storageId)),
  );
}
