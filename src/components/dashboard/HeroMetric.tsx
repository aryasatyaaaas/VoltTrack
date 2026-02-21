import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HeroMetricProps {
    label: string;
    value: string;
    trendPercentage: number;
}

export function HeroMetric({ label, value, trendPercentage }: HeroMetricProps) {
    const isPositive = trendPercentage > 0;
    const isNeutral = trendPercentage === 0;

    return (
        <Card className="flex flex-col items-center justify-center py-10 text-center md:py-16">
            <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                {label}
            </h2>
            <div className="mt-4 text-7xl font-bold tracking-tighter text-white md:text-8xl">
                {value}
                <span className="ml-2 text-2xl font-normal text-zinc-600">kWh</span>
            </div>

            {!isNeutral && (
                <div className="mt-4 flex items-center gap-2">
                    <Badge variant={isPositive ? "danger" : "success"} className="px-3 py-1 text-sm">
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {Math.abs(trendPercentage)}% {isPositive ? "more" : "less"}
                    </Badge>
                    <span className="text-sm text-zinc-500">vs last week</span>
                </div>
            )}
            {isNeutral && (
                <div className="mt-4 text-sm text-zinc-500">Same usage as last week</div>
            )}
        </Card>
    );
}
