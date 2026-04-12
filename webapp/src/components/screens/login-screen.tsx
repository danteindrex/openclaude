import Link from "next/link";

import { demoCredentials, recentLearners } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

export function LoginScreen() {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface px-6 py-4 md:px-8">
        <div className="font-headline text-2xl font-black tracking-tighter text-primary">ElimuCore</div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-on-surface-variant" type="button">
            <span>TT</span>
            <span className="hidden text-sm font-medium sm:inline">English</span>
          </button>
          <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 shadow-neumorphic-raised">
            <span>OFF</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Offline Mode
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-12 lg:px-8">
        <div className="space-y-8 lg:col-span-5">
          <div>
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-primary">
              Local Profile Access
            </h1>
            <p className="text-lg text-on-surface-variant">
              Select your profile to continue the journey on this device.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="font-headline text-sm font-bold uppercase tracking-[0.3em] text-on-surface-variant">
              Recent Learners
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {recentLearners.map((learner, index) => (
                <div key={learner.name} className="group">
                  <div className="aspect-square rounded-full p-1 shadow-neumorphic-raised transition-transform group-hover:scale-[1.03]">
                    {index === 2 ? (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container-low shadow-neumorphic-inset">
                        <span>+</span>
                      </div>
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center rounded-full"
                        style={{ backgroundImage: designTokens.gradients.bannerWash }}
                      >
                        <span className="font-headline text-3xl font-black text-primary">
                          {learner.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-center font-medium">{learner.name}</p>
                  <p className="text-center text-[10px] uppercase tracking-[0.24em] text-secondary">
                    {learner.level}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${shellClassNames.card} flex items-start gap-4 p-6`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span>S</span>
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold">Offline Security Active</h3>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Learner data and progress never leave this hardware. All keys stay local in the
                ElimuCore vault.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className={`relative overflow-hidden ${shellClassNames.card} p-10`}>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <span>A</span>
                <h2 className="font-headline text-xl font-bold">Facilitator Access</h2>
              </div>

              <form className="space-y-8">
                <label className="block space-y-2">
                  <span className="ml-1 font-label text-sm font-semibold text-on-surface-variant">
                    Username / Identifier
                  </span>
                  <div className={`${shellClassNames.inset} flex items-center px-6 py-4`}>
                    <span className="mr-4">U</span>
                    <input
                      className="w-full border-none bg-transparent font-medium text-on-surface outline-none placeholder:text-outline-variant"
                      defaultValue={demoCredentials.student.username}
                      placeholder="e.g. Lead_Facilitator_01"
                      type="text"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="ml-1 font-label text-sm font-semibold text-on-surface-variant">
                    Secure Pin / Password
                  </span>
                  <div className={`${shellClassNames.inset} flex items-center px-6 py-4`}>
                    <span className="mr-4">S</span>
                    <input
                      className="w-full border-none bg-transparent font-medium text-on-surface outline-none placeholder:text-outline-variant"
                      defaultValue={demoCredentials.student.password}
                      placeholder="********"
                      type="password"
                    />
                  </div>
                </label>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-container-low shadow-neumorphic-inset">
                      <span className="h-3 w-3 rounded-sm bg-primary/20" />
                    </span>
                    Remember device
                  </label>
                  <a className="text-sm font-semibold text-primary" href="#">
                    Reset Access
                  </a>
                </div>

                <Link
                  className={`flex w-full items-center justify-center gap-3 px-8 py-5 font-headline text-lg font-bold text-white ${shellClassNames.primaryAction}`}
                  href="/tutor"
                >
                  <span>-&gt;</span>
                  Authorize Session
                </Link>
              </form>

              <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-tactile bg-surface-container-low px-5 py-5 shadow-neumorphic-inset sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
                    Local Database: Connected
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    aria-label="Help"
                    className="rounded-xl bg-surface-container-lowest p-2 text-on-surface-variant shadow-neumorphic-raised"
                    type="button"
                  >
                    <span>?</span>
                  </button>
                  <button
                    aria-label="Settings"
                    className="rounded-xl bg-surface-container-lowest p-2 text-on-surface-variant shadow-neumorphic-raised"
                    type="button"
                  >
                    <span>gear</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-surface-container px-5 py-4 shadow-neumorphic-inset">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Demo Credentials
                </p>
                <p className="mt-2 text-sm leading-7 text-on-surface">
                  Student: <strong>{demoCredentials.student.username}</strong> /{" "}
                  <strong>{demoCredentials.student.password}</strong>
                  <br />
                  Facilitator: <strong>{demoCredentials.facilitator.username}</strong> /{" "}
                  <strong>{demoCredentials.facilitator.password}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 px-6 py-6 text-[10px] uppercase tracking-[0.32em] text-on-surface-variant md:flex-row md:px-8">
        <p>ElimuCore v1.0.2 - Educational Integrity Framework</p>
        <div className="flex gap-8">
          <span>System Status</span>
          <span>Documentation</span>
        </div>
      </footer>
    </main>
  );
}
