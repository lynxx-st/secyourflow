import { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Stat {
    label: string;
    value: string | number;
    icon?: ComponentType<{ size?: number }>;
    trend?: {
        value: string | number;
        isUp?: boolean;
        neutral?: boolean;
    };
}

interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: ReactNode;
    actions?: ReactNode;
    stats?: Stat[];
    className?: string;
}

export function PageHeader({ title, description, badge, actions, stats, className }: PageHeaderProps) {
    return (
        <section className={cn(
            "relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 py-6 sm:px-8 sm:py-7 transition-all duration-300",
            "bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]",
            "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
            className
        )}>
            {/* Premium background effects */}
            <div className="pointer-events-none absolute right-[-50px] top-[-100px] h-64 w-64 rounded-full bg-[var(--accent-1-soft)] blur-[100px] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="pointer-events-none absolute left-[-20px] bottom-[-40px] h-40 w-40 rounded-full bg-[var(--accent-1-dim)] blur-[80px]" />

            <div className="relative flex flex-col gap-6">
                {/* Header Content Row */}
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    <div className="flex-1 min-w-0 xl:min-w-[280px]">
                        {badge && (
                            <div className="type-label mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--line-3)] bg-[var(--accent-1-soft)] px-2.5 py-1 text-[var(--accent-1-strong)]">
                                {badge}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <h1 className="type-display text-[var(--text-primary)]">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {actions && (
                        <div className="flex w-full flex-wrap items-start gap-2 xl:w-auto xl:max-w-[65%] xl:justify-end xl:pt-1">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Analytics Section */}
                {stats && stats.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-[var(--border-color)]/60">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="flex items-center gap-3.5 group/stat">
                                    {Icon && (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-muted)] transition-colors group-hover/stat:border-[var(--line-3)] group-hover/stat:text-[var(--accent-1)]">
                                            <Icon size={18} />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="type-label text-[var(--text-muted)] group-hover/stat:text-[var(--text-secondary)] transition-colors">
                                            {stat.label}
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="type-title text-[var(--text-primary)]">
                                                {stat.value}
                                            </span>
                                            {stat.trend && (
                                                <span className={cn(
                                                    "type-caption font-semibold",
                                                    stat.trend.neutral ? "text-[var(--text-muted)]" :
                                                        stat.trend.isUp ? "text-emerald-400" : "text-red-400"
                                                )}>
                                                    {stat.trend.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
