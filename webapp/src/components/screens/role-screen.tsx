import Link from "next/link";

import { roleCards } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

export function RoleScreen() {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <header className="flex items-center justify-between bg-surface px-6 py-4 md:px-8">
        <div className="font-headline text-2xl font-black tracking-tighter text-primary">
          ElimuCore
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="rounded-xl bg-surface-container-lowest px-3 py-2 text-xs font-black text-primary shadow-neumorphic-raised" type="button">
            {designTokens.iconMarks.translate}
          </button>
          <button className="rounded-xl bg-surface-container-lowest px-3 py-2 text-xs font-black text-primary shadow-neumorphic-raised" type="button">
            {designTokens.iconMarks.wifiOff}
          </button>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-12 md:px-8">
        <div className="w-full">
          <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant shadow-neumorphic-raised transition-transform hover:scale-[1.02]"
              href="/welcome"
            >
              <span>{designTokens.iconMarks.arrowBack}</span>
              Back to Welcome
            </Link>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
              Who is learning today?
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
              Select your access level to personalize the stitched workspace and continue with the
              right shell.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <Link
                className="flex h-full flex-col justify-between rounded-tactileLg bg-surface-container-lowest p-10 shadow-neumorphic-raised transition-transform hover:-translate-y-1"
                href={roleCards[0].href}
              >
                <div className="space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-gradient text-white shadow-neumorphic-raised">
                    <span className="text-[1.2rem] font-black leading-none">{designTokens.iconMarks.school}</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-headline text-2xl font-bold">Student</h2>
                    <p className="leading-relaxed text-on-surface-variant">
                      Access personalized lessons, track progress, and interact with the offline
                      learning path.
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex items-center gap-2 font-bold text-primary">
                  Enter Workspace
                  <span>{designTokens.iconMarks.arrowForward}</span>
                </div>
              </Link>
            </div>

            <div className="grid gap-8 md:col-span-7">
              {roleCards.slice(1).map((item) => (
                <Link
                  key={item.title}
                  className="flex items-center gap-6 rounded-tactileLg bg-surface-container-lowest p-8 shadow-neumorphic-raised transition-transform hover:-translate-y-1"
                  href={item.href}
                >
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high text-secondary">
                    <span className="text-[1rem] font-black leading-none">{designTokens.iconMarks[item.icon as keyof typeof designTokens.iconMarks] ?? item.icon}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="font-headline text-xl font-bold">{item.title}</h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                      {item.copy}
                    </p>
                  </div>
                  <span>{designTokens.iconMarks.arrowForward}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-24 h-px w-full bg-gradient-to-r from-transparent via-surface-container-high to-transparent" />
          <p className="mt-10 text-center font-headline text-lg italic text-on-surface-variant">
            "Empowering local communities through tactile digital learning."
          </p>
        </div>
      </section>
    </main>
  );
}
