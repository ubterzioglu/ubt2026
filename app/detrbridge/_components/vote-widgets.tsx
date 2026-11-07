import { DETRBRIDGE_GOLD } from "@/app/detrbridge/_components/theme";

interface VoteEntry {
  voterName: string;
  rating: number;
}

interface VotedItem {
  votes: VoteEntry[];
}

/** The fixed panel of eligible voters, shown on every item regardless of vote status. */
const DETRBRIDGE_VOTERS = ["Sefa", "Sümeyye", "Fatih", "UBT", "Şahin", "Murat", "Aslıhan"];

/**
 * Full voter roster per item: everyone who voted shows green with their
 * rating, everyone who hasn't yet shows red. Matching is case-insensitive
 * so minor casing differences in stored names don't hide a vote.
 */
export function VotesList({ votes }: { votes: VoteEntry[] }) {
  const voteByLowerName = new Map(votes.map((vote) => [vote.voterName.trim().toLowerCase(), vote]));
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-2">
      {DETRBRIDGE_VOTERS.map((voter) => {
        const vote = voteByLowerName.get(voter.toLowerCase());
        return (
          <span
            key={voter}
            className={
              vote
                ? "inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                : "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[11px] font-medium text-rose-300/80"
            }
          >
            {voter}
            {vote ? <span className="font-bold text-emerald-100">{vote.rating}</span> : null}
          </span>
        );
      })}
    </div>
  );
}

/** Read-only average-rating badge, e.g. 7.2/10 (5 oy). */
export function RatingBadge({
  averageRating,
  voteCount
}: {
  averageRating: number | null;
  voteCount: number;
}) {
  if (averageRating === null) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-white/40">
        Henüz oy yok
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em]"
      style={{ color: DETRBRIDGE_GOLD }}
      title={`${averageRating.toFixed(1)}/10 · ${voteCount} oy`}
    >
      {averageRating.toFixed(1)}/10 ({voteCount})
    </span>
  );
}

/** Per-voter total vote count across all items, sorted highest first. */
export function VoterTallyCard({ items, question }: { items: VotedItem[]; question: string }) {
  const countByLowerName = new Map<string, number>();
  for (const item of items) {
    for (const vote of item.votes) {
      const key = vote.voterName.trim().toLowerCase();
      countByLowerName.set(key, (countByLowerName.get(key) ?? 0) + 1);
    }
  }
  const tally = DETRBRIDGE_VOTERS.map((voter) => ({
    voter,
    count: countByLowerName.get(voter.toLowerCase()) ?? 0
  })).sort((a, b) => b.count - a.count);

  return (
    <details className="group/tally mt-3 overflow-hidden rounded-[1rem] border border-emerald-400/40 bg-emerald-400/[0.08] shadow-[0_0_0_1px_rgba(52,211,153,0.15)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[12px] font-bold text-emerald-300 transition hover:text-emerald-200 [&::-webkit-details-marker]:hidden">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
        {question}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-auto text-emerald-300/70 transition-transform duration-200 group-open/tally:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="flex flex-wrap gap-1.5 border-t border-emerald-400/20 px-4 py-3">
        {tally.map(({ voter, count }) => (
          <span
            key={voter}
            className={
              count > 0
                ? "inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                : "inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-[11px] font-medium text-rose-300/80"
            }
          >
            {voter}
            <span className="font-bold">{count}</span>
          </span>
        ))}
      </div>
    </details>
  );
}
