import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { dashboardHighlights, dashboardStats } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

export function DashboardScreen() {
  return (
    <AppShell activePath="/dashboard" subtitle="Student workspace" title="Student Dashboard">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                Habari, Musana!
              </h1>
              <p className="mt-2 text-lg text-on-surface-variant">
                Ready to continue? You are doing great today.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {dashboardStats.map((stat) => (
                <article key={stat.label} className={`${shellClassNames.card} flex items-center gap-4 p-4`}>
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      stat.tone === "warm"
                        ? "bg-[#ffefe3] text-[#c55b1a]"
                        : stat.tone === "cool"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container text-secondary",
                    ].join(" ")}
                  >
                    <span className="text-[0.75rem] font-black leading-none text-primary">
                      {designTokens.iconMarks[stat.icon as keyof typeof designTokens.iconMarks] ?? stat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-outline">{stat.label}</p>
                    <p className="font-headline text-xl font-bold">{stat.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <article className={`${shellClassNames.card} overflow-hidden p-2`}>
            <div className="relative h-64 overflow-hidden rounded-[1.25rem]">
              <div
                className="absolute inset-0"
                style={{ backgroundImage: designTokens.gradients.heroTint }}
              />
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <span className="mb-3 inline-flex rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                    Recently Viewed
                  </span>
                  <h2 className="font-headline text-3xl font-bold text-white">Python Basics</h2>
                  <p className="font-medium text-white/80">Module 4: Loops and Logic</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 px-6 py-6 md:flex-row md:items-end md:justify-between">
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">Course Progress</span>
                  <span className="text-sm font-bold">64%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high shadow-neumorphic-inset">
                  <div className="h-full w-[64%] rounded-full bg-primary-gradient" />
                </div>
              </div>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-neumorphic-raised transition-transform hover:scale-[1.02] active:scale-95"
                href="/catalog"
              >
                Resume
              </Link>
            </div>
          </article>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <article className={`${shellClassNames.card} relative overflow-hidden p-8`}>
            <div className="absolute -right-4 -top-4 opacity-5">
              <span className="text-[120px] font-black leading-none text-primary/10">
                {designTokens.iconMarks.smartToy}
              </span>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-white">
                <span className="text-[0.9rem] font-black leading-none">{designTokens.iconMarks.bolt}</span>
              </div>
              <h2 className="font-headline text-lg font-bold">ElimuBot Tips</h2>
            </div>
            <p className="mb-6 italic leading-relaxed text-on-surface-variant">
              "Musana, it is 10 AM. Solving one coding challenge now could improve your retention
              of loops by 40%."
            </p>
            <div className="rounded-xl bg-surface-container p-4 shadow-neumorphic-inset">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.28em] text-primary">
                Local Suggestion
              </p>
              <p className="text-sm font-medium text-on-surface">
                Try the Daily Loop micro-challenge. Cached locally for instant access.
              </p>
            </div>
          </article>

          <article className={`${shellClassNames.card} p-8`}>
            <h2 className="mb-6 font-headline text-lg font-bold">Mastery Level</h2>
            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  className="text-surface-container-high"
                  stroke="currentColor"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  className="text-primary"
                  stroke="currentColor"
                  strokeDasharray="440"
                  strokeDashoffset="110"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-black text-primary">75%</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-outline">
                  Overall
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {["workspace_premium", "auto_awesome", "groups"].map((icon) => (
                <div
                  key={icon}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-secondary"
                >
                  <span className="text-[0.75rem] font-black leading-none">
                    {designTokens.iconMarks[icon as keyof typeof designTokens.iconMarks] ?? icon}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold">Course Highlights</h2>
            <Link className="text-sm font-bold text-primary" href="/catalog">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {dashboardHighlights.map((item) => (
              <article key={item.title} className={`${shellClassNames.card} flex flex-col overflow-hidden p-2`}>
                <div className="relative h-48 overflow-hidden rounded-[1.25rem]">
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: designTokens.gradients.bannerWash }}
                  />
                  <div className="absolute inset-0 flex items-end p-5">
                    <div className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                  <div>
                    <h3 className="font-headline text-base font-bold leading-tight">{item.title}</h3>
                    <p className="mt-2 text-xs text-on-surface-variant">{item.subtitle}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                      <span>Course Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container shadow-neumorphic-inset">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <button
            className={`${shellClassNames.fabAction} fixed bottom-8 right-8 z-40 hidden h-16 w-16 items-center justify-center md:flex`}
            type="button"
          >
            <span className="text-[28px] font-black leading-none">{designTokens.iconMarks.add}</span>
          </button>
        </div>
      </section>
    </AppShell>
  );
}

