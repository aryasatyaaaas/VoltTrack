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
                "relative rounded-3xl border bg-white p-6 transition-all duration-300",
                "border-[var(--border)]",
                "shadow-sm",
                "hover:shadow-md",
                glow &&
                "before:absolute before:-inset-4 before:-z-10 before:rounded-[2rem] before:bg-[radial-gradient(ellipse,rgba(255,107,53,0.15)_0%,transparent_60%)] before:blur-xl",
                className
            )}
        >
            {children}
        </div>
    );
}
