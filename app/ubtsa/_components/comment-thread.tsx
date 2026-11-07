import { ItemCommentThread } from "@/components/item-comment-thread";
import type {
  ItemCommentThreadProps,
  ItemCommentThreadTheme
} from "@/components/item-comment-thread";

const THEME: ItemCommentThreadTheme = {
  article:
    "rounded-[0.8rem] border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_4px_14px_-10px_rgba(15,23,42,0.35)]",
  author: "text-[12px] font-bold capitalize tracking-tight text-teal-800",
  date: "text-[11px] text-slate-400",
  deleteButton:
    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40",
  body: "whitespace-pre-wrap text-[13.5px] leading-6 text-slate-600",
  textarea:
    "w-full resize-y rounded-[0.8rem] border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] leading-6 text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10",
  submit:
    "self-start rounded-[0.7rem] bg-teal-700 px-4 py-2 text-[12.5px] font-bold tracking-tight text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
};

export function CommentThread(props: Readonly<ItemCommentThreadProps>) {
  return <ItemCommentThread {...props} theme={THEME} />;
}
