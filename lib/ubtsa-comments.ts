import "server-only";

import { createItemComments } from "@/lib/item-comments";
import type { ItemComment, ItemCommentsResult } from "@/lib/item-comments";
import { UBTSA_ITEM_KEYS } from "@/content/ubtsa-konsept";

export type UbtsaComment = ItemComment;
export type UbtsaCommentsResult = ItemCommentsResult;

const comments = createItemComments({ table: "ubtsa_comments", itemKeys: UBTSA_ITEM_KEYS });

export const getAllUbtsaComments = comments.getAll;
export const addUbtsaComment = comments.add;
export const deleteUbtsaComment = comments.remove;
