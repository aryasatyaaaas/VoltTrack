import { Card } from "@/components/ui/Card";
import { Lightbulb, DollarSign } from "lucide-react";

interface InsightCardProps {
    insight: string;
}

export function InsightCard({ insight }: InsightCardProps) {
    const isCostInsight = insight.toLowerCase().includes("cost");

    return (
        <Card className="flex items-start gap-4 border-l-4 border-l-cyan-500 bg-cyan-500/5 p-4 md:p-6">
            <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-500">
                {isCostInsight ? <DollarSign className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
            </div>
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Smart Insight
                </h3>
                <p className="mt-1 text-lg font-medium text-cyan-100">{insight}</p>
            </div>
        </Card>
    );
}
