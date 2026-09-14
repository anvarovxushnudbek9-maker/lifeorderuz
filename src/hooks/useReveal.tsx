import * as React from "react";

/**
 * Reveals an element once it scrolls into view.
 * Usage: const ref = useReveal<HTMLDivElement>(); <div ref={ref} className="reveal" />
 */
export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-visible", "true");
      return;
    }

    el.style.transitionDelay = `${delayMs}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-visible", "true");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return ref;
}

export function Reveal({
  delay = 0,
  className = "",
  children,
  as: Tag = "div",
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
