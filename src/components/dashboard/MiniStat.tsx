import { Card } from "@/components/ui/Card";

interface MiniStatProps {
    label: string;
    value: string;
    subtext?: string;
    icon?: React.ReactNode;
}

export function MiniStat({ label, value, subtext, icon }: MiniStatProps) {
    return (
        <Card className="flex flex-col justify-between p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    {label}
                </h3>
                {icon && <div className="text-zinc-500">{icon}</div>}
            </div>
            <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
                {subtext && <p className="mt-1 text-xs text-zinc-500">{subtext}</p>}
            </div>
        </Card>
    );
}
