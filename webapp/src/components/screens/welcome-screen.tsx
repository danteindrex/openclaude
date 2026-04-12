import Link from "next/link";

import { welcomeHighlights } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

export function WelcomeScreen() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface px-6 py-4 md:px-8">
        <div className="font-headline text-2xl font-black tracking-tighter text-primary">
          ElimuCore
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-surface-container-low px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary shadow-neumorphic-inset sm:flex">
            EN | SW
          </div>
          <button
            aria-label="Translate"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-neumorphic-raised"
            type="button"
          >
            <span>{designTokens.iconMarks.translate}</span>
          </button>
          <button
            aria-label="Offline status"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-neumorphic-raised"
            type="button"
          >
            <span>{designTokens.iconMarks.wifiOff}</span>
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="space-y-8 lg:col-span-6">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-[0.32em] text-white shadow-neumorphic-raised">
              The Future of Local Learning
            </span>
            <h1 className="max-w-xl font-headline text-5xl font-extrabold leading-[1.05] tracking-tight text-primary md:text-7xl">
              The Tactile Scholar
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-on-surface-variant">
              A private, offline-first educational workspace for schools and labs that need a
              premium learning experience without depending on the cloud.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link className={`inline-flex items-center gap-3 px-8 py-4 font-bold ${shellClassNames.primaryAction}`} href="/role">
              Get Started
              <span>{designTokens.iconMarks.arrowForward}</span>
            </Link>
            <Link
              className={`inline-flex items-center justify-center px-8 py-4 font-bold text-primary ${shellClassNames.raised}`}
              href="/login"
            >
              Watch Demo
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {welcomeHighlights.map((item) => (
              <article key={item.title} className={shellClassNames.inset + " p-6"}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span>{designTokens.iconMarks[item.icon as keyof typeof designTokens.iconMarks] ?? item.icon}</span>
                </div>
                <h2 className="font-headline text-sm font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative flex aspect-square items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-surface-container-lowest opacity-60 shadow-neumorphic-raised" />
            <div className={`absolute left-8 top-10 w-52 -rotate-6 p-4 ${shellClassNames.heroCard}`}>
              <div className="mb-3 h-32 rounded-2xl" style={{ backgroundImage: designTokens.gradients.bannerWash }} />
              <div className="space-y-2">
                <div className="h-2 w-24 rounded-full bg-surface-container" />
                <div className="h-2 w-16 rounded-full bg-surface-container" />
              </div>
            </div>
            <div className={`absolute bottom-8 right-10 w-60 rotate-3 p-4 ${shellClassNames.heroCard}`}>
              <div className="mb-3 h-36 rounded-2xl" style={{ backgroundImage: designTokens.gradients.bannerWashAlt }} />
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary-container/20" />
                <div className="h-2 flex-1 rounded-full bg-surface-container" />
              </div>
            </div>
            <div className="relative flex h-72 w-72 items-center justify-center rounded-[2.5rem] bg-surface-container shadow-neumorphic-inset">
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-surface-container-lowest shadow-neumorphic-raised">
                <span className="text-[7rem] font-black leading-none text-primary/10">{designTokens.iconMarks.school}</span>
              </div>
            </div>
            <div className="absolute right-8 top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-neumorphic-raised">
              <span>{designTokens.iconMarks.code}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-8">
        <div className={shellClassNames.surfacePanel}>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">The ElimuCore Promise</h2>
              <p className="mt-2 max-w-2xl text-on-surface-variant">
                Built for regions where connectivity is scarce. Designed to feel calm, tactile,
                and intentionally local.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-2xl font-black tracking-tighter text-on-surface-variant/60">
              <span>LOCAL_DB</span>
              <span>SECURE_NODE</span>
              <span>PRIVATE_AI</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
