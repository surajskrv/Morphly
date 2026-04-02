export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="surface-panel rounded-[1.6rem] sm:rounded-[2rem] border border-border/70 px-4 py-5 sm:px-7 sm:py-7">
        <div className="h-5 w-40 rounded-full bg-muted shimmer-placeholder" />
        <div className="mt-4 h-10 sm:h-12 max-w-2xl rounded-[1.25rem] bg-muted shimmer-placeholder" />
        <div className="mt-3 h-5 max-w-3xl rounded-full bg-muted shimmer-placeholder" />
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="h-10 w-full sm:w-32 rounded-2xl bg-muted shimmer-placeholder" />
          <div className="h-10 w-full sm:w-32 rounded-2xl bg-muted shimmer-placeholder" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card rounded-[1.5rem] border border-border/70 p-4 sm:p-5">
            <div className="h-4 w-28 rounded-full bg-muted shimmer-placeholder" />
            <div className="mt-4 h-10 w-24 rounded-2xl bg-muted shimmer-placeholder" />
            <div className="mt-3 h-4 w-full rounded-full bg-muted shimmer-placeholder" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card rounded-[1.75rem] border border-border/70 p-5 sm:p-6">
          <div className="h-6 w-48 rounded-2xl bg-muted shimmer-placeholder" />
          <div className="mt-3 h-10 sm:h-12 max-w-xl rounded-[1.25rem] bg-muted shimmer-placeholder" />
          <div className="mt-3 h-4 w-full max-w-md rounded-full bg-muted shimmer-placeholder" />
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="h-10 w-full sm:w-36 rounded-xl bg-muted shimmer-placeholder" />
            <div className="h-10 w-full sm:w-36 rounded-xl bg-muted shimmer-placeholder" />
          </div>
        </div>
        <div className="surface-card rounded-[1.75rem] border border-border/70 p-5 sm:p-6">
          <div className="h-6 w-44 rounded-2xl bg-muted shimmer-placeholder" />
          <div className="mt-2 h-4 w-64 rounded-full bg-muted shimmer-placeholder" />
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/82 p-4">
              <div className="h-5 w-40 rounded-xl bg-muted shimmer-placeholder" />
              <div className="mt-3 h-4 w-28 rounded-full bg-muted shimmer-placeholder" />
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-background/82 p-4">
              <div className="h-3 w-24 rounded bg-muted shimmer-placeholder" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded bg-muted/70 shimmer-placeholder" />
                <div className="h-4 w-5/6 rounded bg-muted/70 shimmer-placeholder" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

