import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const wardrobeCategoryValidator = v.union(
  v.literal("tops"),
  v.literal("bottoms"),
  v.literal("shoes"),
  v.literal("hats"),
);

export default defineSchema({
  wardrobeItems: defineTable({
    storageId: v.id("_storage"),
    category: wardrobeCategoryValidator,
    fileName: v.optional(v.string()),
    contentType: v.optional(v.string()),
    size: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_storageId", ["storageId"]),
});
