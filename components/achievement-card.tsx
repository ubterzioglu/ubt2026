import Image from "next/image";

import type { AchievementItem } from "@/types/site";

interface AchievementCardProps {
  achievement: Readonly<AchievementItem>;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <article className="group flex aspect-square flex-col overflow-hidden rounded-[1.35rem] border border-line/80 bg-white/82 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-glow sm:rounded-[1.6rem]">
      <div className="min-h-0 flex-1 overflow-hidden rounded-t-[1.35rem] bg-gradient-to-br from-accent/20 to-sunrise/20 sm:rounded-t-[1.6rem]">
        {achievement.image ? (
          <div className="relative h-full w-full">
            <Image
              src={achievement.image}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 items-start p-4 sm:p-5">
        <p className="line-clamp-5 text-sm leading-6 text-ink/74 sm:text-[0.95rem] sm:leading-7">
          {achievement.text}
        </p>
      </div>
    </article>
  );
}
