import { ItemCommentThread } from "@/components/item-comment-thread";
import type {
  ItemCommentThreadProps,
  ItemCommentThreadTheme
} from "@/components/item-comment-thread";

const THEME: ItemCommentThreadTheme = {
  wrapper: "space-y-2.5",
  article: "rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3.5 py-2.5",
  author: "text-[12px] font-bold capitalize tracking-tight text-[#F5D77A]",
  date: "text-[11px] text-white/35",
  deleteButton:
    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white/40 transition hover:bg-rose-400/10 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40",
  body: "whitespace-pre-wrap text-[13px] leading-6 text-white/70",
  textarea:
    "w-full resize-y rounded-[0.9rem] border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] leading-6 text-white placeholder:text-white/25 outline-none transition focus:border-[#F5B700]/55 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#F5B700]/12",
  submit:
    "self-start rounded-[0.8rem] bg-[#F5B700] px-4 py-2 text-[12.5px] font-bold tracking-tight text-black transition hover:bg-[#ffc933] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700]/50"
};

export function BriefCommentThread(props: Readonly<ItemCommentThreadProps>) {
  return <ItemCommentThread {...props} theme={THEME} />;
}
