import { StoryItem } from "@/types";
import { Zap, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryListProps {
    stories: StoryItem[];
}

const icons = {
    zap: Zap,
    "trending-up": TrendingUp,
    "trending-down": TrendingDown,
    "dollar-sign": DollarSign,
    calendar: Calendar,
};

export function StoryList({ stories }: StoryListProps) {
    if (stories.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Insights
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => {
                    const Icon = icons[story.icon];
                    const isPositive = story.type === "positive";
                    const isNegative = story.type === "negative";
                    const isNeutral = story.type === "neutral";

                    return (
                        <div
                            key={story.id}
                            className={cn(
                                "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-lg",
                                isPositive && "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30",
                                isNegative && "border-red-500/20 bg-red-500/5 hover:border-red-500/30",
                                isNeutral && "border-white/5 bg-white/[0.02] hover:border-white/10"
                            )}
                        >
                            <div
                                className={cn(
                                    "mb-3 w-fit rounded-full p-2.5",
                                    isPositive && "bg-emerald-500/10 text-emerald-400",
                                    isNegative && "bg-red-500/10 text-red-400",
                                    isNeutral && "bg-zinc-800 text-zinc-400"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-zinc-200">
                                {story.text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
