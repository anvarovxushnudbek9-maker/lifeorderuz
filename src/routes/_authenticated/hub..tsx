import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageHeader } from "@/components/PageHeader";
import { hubBySlug } from "@/lib/hubs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/hub/$hub")({
  head: ({ params }) => {
    const hub = hubBySlug(params.hub);
    const title = \`\${hub?.title ?? "Hub"} — Life Order\`;
    const desc = hub?.subtitle ?? "Life Order hublari.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: HubPage,
  notFoundComponent: () => <EmptyHub />,
  errorComponent: () => <EmptyHub />,
});

function EmptyHub() {
  return (
    <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
      Bunday hub topilmadi.
    </div>
  );
}

function HubPage() {
  const { hub: slug } = Route.useParams();
  const hub = hubBySlug(slug);
  if (!hub) throw notFound();

  return (
    <div>
      <PageHeader title={hub.title} subtitle={hub.subtitle} />

      <div className="grid gap-3 sm:grid-cols-2">
        {hub.modules.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:bg-accent"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <m.icon className="size-5 text-primary" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="block text-xs text-muted-foreground">{m.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
