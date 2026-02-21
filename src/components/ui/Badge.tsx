import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    danger: "bg-red-500/15 text-red-400 border-red-500/20",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    info: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    neutral: "bg-white/10 text-zinc-400 border-white/10",
};

export function Badge({
    children,
    variant = "neutral",
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
