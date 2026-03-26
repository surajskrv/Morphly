export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="surface-panel rounded-[2rem] border border-border/70 px-5 py-6 sm:px-7 sm:py-7">
        <div className="h-5 w-40 rounded-full bg-muted shimmer-placeholder" />
        <div className="mt-4 h-12 max-w-2xl rounded-[1.25rem] bg-muted shimmer-placeholder" />
        <div className="mt-3 h-5 max-w-3xl rounded-full bg-muted shimmer-placeholder" />
        <div className="mt-6 flex gap-2">
          <div className="h-10 w-32 rounded-2xl bg-muted shimmer-placeholder" />
          <div className="h-10 w-32 rounded-2xl bg-muted shimmer-placeholder" />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card rounded-[1.6rem] border border-border/70 p-5">
            <div className="h-4 w-28 rounded-full bg-muted shimmer-placeholder" />
            <div className="mt-4 h-10 w-24 rounded-2xl bg-muted shimmer-placeholder" />
            <div className="mt-3 h-4 w-full rounded-full bg-muted shimmer-placeholder" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="surface-card rounded-[1.75rem] border border-border/70 p-5 sm:p-6">
            <div className="h-6 w-48 rounded-2xl bg-muted shimmer-placeholder" />
            <div className="mt-2 h-4 w-72 rounded-full bg-muted shimmer-placeholder" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 2 }).map((__, cardIndex) => (
                <div key={cardIndex} className="rounded-[1.5rem] border border-border/70 bg-background/82 p-4">
                  <div className="h-5 w-40 rounded-xl bg-muted shimmer-placeholder" />
                  <div className="mt-3 h-4 w-28 rounded-full bg-muted shimmer-placeholder" />
                  <div className="mt-4 h-16 rounded-[1rem] bg-muted shimmer-placeholder" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
