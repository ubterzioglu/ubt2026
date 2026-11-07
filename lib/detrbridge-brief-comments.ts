import "server-only";

import { createItemComments } from "@/lib/item-comments";
import type { ItemComment, ItemCommentsResult } from "@/lib/item-comments";
import { DETRBRIDGE_BRIEF_ITEM_KEYS } from "@/content/detrbridge-brief";

export type BriefComment = ItemComment;
export type BriefCommentsResult = ItemCommentsResult;

const comments = createItemComments({
  table: "detrbridge_brief_comments",
  itemKeys: DETRBRIDGE_BRIEF_ITEM_KEYS
});

export const getAllBriefComments = comments.getAll;
export const addBriefComment = comments.add;
export const deleteBriefComment = comments.remove;
