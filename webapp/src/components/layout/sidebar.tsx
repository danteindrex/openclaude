import Link from "next/link";

import { stitchedNavItems } from "@/lib/demo-data";
import { designTokens, shellClassNames, type RoutePath } from "@/lib/design-tokens";

type SidebarProps = {
  activePath: RoutePath;
};

function isActiveRoute(activePath: RoutePath, href: RoutePath) {
  return activePath === href;
}

export function Sidebar({ activePath }: SidebarProps) {
  return (
    <>
      <aside className={`fixed left-0 top-0 hidden h-screen w-64 flex-col p-6 text-on-surface md:flex ${shellClassNames.sidebar}`}>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-gradient text-sm font-black text-on-primary shadow-neumorphic-raised">
            E
          </div>
          <div>
            <p className="font-headline text-2xl font-black tracking-tighter text-primary">ElimuCore</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-on-surface-variant">
              Offline Mode Active
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {stitchedNavItems.map((item) => {
            const active = isActiveRoute(activePath, item.href);

            return (
              <Link
                key={item.label}
                className={[
                  "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                  active
                    ? "translate-x-1 bg-primary text-on-primary shadow-neumorphic-raised"
                    : "bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                ].join(" ")}
                href={item.href}
              >
                <span className={shellClassNames.iconBadgeSmall}>
                  {designTokens.iconMarks[item.icon as keyof typeof designTokens.iconMarks] ?? item.icon}
                </span>
                <span className="font-label text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className={`${shellClassNames.card} p-4`}>
            <div className="flex items-center gap-3">
              <div className={`${shellClassNames.pill} h-10 w-10 overflow-hidden`}>
                <div className="flex h-full w-full items-center justify-center bg-primary-gradient text-sm font-bold text-on-primary">
                  TS
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate font-headline text-sm font-bold">The Tactile Scholar</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary">Offline Mode Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 gap-1 bg-surface p-2 shadow-[0_-6px_18px_rgba(23,28,33,0.05)] md:hidden">
        {stitchedNavItems.slice(0, 4).map((item) => {
          const active = isActiveRoute(activePath, item.href);

          return (
            <Link
              key={item.label}
              className={[
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors",
                active ? "text-primary" : "text-on-surface-variant",
              ].join(" ")}
              href={item.href}
            >
              <span className={shellClassNames.iconBadgeSmall}>
                {designTokens.iconMarks[item.icon as keyof typeof designTokens.iconMarks] ?? item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

