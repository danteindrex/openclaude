import { AppShell } from "@/components/layout/app-shell";
import { catalogCourses, catalogFilters } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

export function CatalogScreen() {
  return (
    <AppShell activePath="/catalog" subtitle="Course library" title="Course Catalog">
      <section className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-2xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              /
            </span>
            <input
              className={`w-full px-12 py-4 text-sm outline-none placeholder:text-outline-variant ${shellClassNames.inset}`}
              placeholder="Search local database for courses..."
              type="search"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {catalogFilters.map((filter, index) => (
              <button
                key={filter}
                className={[
                  "rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]",
                  index === 0
                    ? "bg-primary text-white shadow-neumorphic-raised"
                    : "bg-surface-container-low text-on-surface-variant shadow-neumorphic-raised",
                ].join(" ")}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {catalogCourses.map((course) => (
            <article
              key={course.title}
              className={`${shellClassNames.card} flex flex-col p-2 transition-transform hover:scale-[1.01]`}
            >
              <div className="relative mb-4 h-48 overflow-hidden rounded-[1.25rem]">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: designTokens.gradients.bannerWash }}
                />
                <div className="absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                  {course.category}
                </div>
              </div>

              <div className="space-y-4 px-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-headline text-lg font-bold leading-tight">{course.title}</h2>
                  <div className="flex items-center gap-1 rounded bg-surface-container px-2 py-1 text-[10px] font-bold text-secondary">
                    <span>EN</span>
                    {course.language}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                    <span>{course.progress === 100 ? "Complete" : course.status}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high shadow-neumorphic-inset">
                    <div
                      className={
                        course.progress === 100
                          ? "h-full w-full rounded-full bg-secondary"
                          : "h-full rounded-full bg-primary-gradient"
                      }
                      style={course.progress === 100 ? undefined : { width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  className={[
                    "flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                    course.progress === 100
                      ? "bg-surface-container-low text-secondary shadow-neumorphic-raised"
                      : "bg-surface-container-low text-primary shadow-neumorphic-raised",
                  ].join(" ")}
                  type="button"
                >
                  {course.progress === 100 ? (
                    <>
                      <span className="mr-2">v</span>
                      {course.status}
                    </>
                  ) : (
                    course.status
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

