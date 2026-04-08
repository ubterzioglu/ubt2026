import type { AchievementItem } from "@/types/site";

interface AchievementCardProps {
  achievement: Readonly<AchievementItem>;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-line/80 bg-white/82 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem]">
      <div
        aria-hidden="true"
        className="aspect-square rounded-t-[1.35rem] bg-gradient-to-br from-accent/20 to-sunrise/20 sm:rounded-t-[1.6rem]"
      />
      <div className="p-4 sm:p-5">
        <p className="text-sm leading-7 text-ink/74 sm:text-base sm:leading-8">
          {achievement.text}
        </p>
      </div>
    </article>
  );
}
