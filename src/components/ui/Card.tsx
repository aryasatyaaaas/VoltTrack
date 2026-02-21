import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
}

export function Card({ children, className, glow = false }: CardProps) {
    return (
        <div
            className={cn(
                "relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl",
                "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]",
                "transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15]",
                glow &&
                "before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-br before:from-cyan-500/10 before:to-blue-500/5 before:blur-xl",
                className
            )}
        >
            {children}
        </div>
    );
}
