interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-14" />
                </div>
                <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 w-24" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex gap-8 border-t border-slate-100 dark:border-slate-800">
                    {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-4 w-24" />
                    ))}
                </div>
            ))}
        </div>
    );
}
