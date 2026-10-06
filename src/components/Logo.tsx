import { cn } from "@/lib/utils";

/** Life Order mark: three stacked bars forming an ascending "order" + wordmark. */
export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-xl gradient-primary shadow-elegant">
        <svg viewBox="0 0 24 24" className="size-4 text-primary-foreground" aria-hidden>
          <rect x="4" y="14" width="4" height="6" rx="1.2" fill="currentColor" opacity="0.6" />
          <rect x="10" y="9" width="4" height="11" rx="1.2" fill="currentColor" opacity="0.8" />
          <rect x="16" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
        </svg>
      </span>
      {withText && <span className="text-base font-bold tracking-tight">Life Order</span>}
    </span>
  );
}
