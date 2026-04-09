import type { AchievementItem } from "@/types/site";

interface AchievementCardProps {
  achievement: Readonly<AchievementItem>;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <article className="flex aspect-square flex-col overflow-hidden rounded-[1.35rem] border border-line/80 bg-white/82 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem]">
      <div
        aria-hidden="true"
        className="min-h-0 flex-1 rounded-t-[1.35rem] bg-gradient-to-br from-accent/20 to-sunrise/20 sm:rounded-t-[1.6rem]"
      />
      <div className="flex min-h-0 flex-1 items-start p-4 sm:p-5">
        <p className="line-clamp-5 text-sm leading-6 text-ink/74 sm:text-[0.95rem] sm:leading-7">
          {achievement.text}
        </p>
      </div>
    </article>
  );
}
