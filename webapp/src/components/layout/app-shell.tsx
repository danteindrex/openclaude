import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { shellClassNames, type RoutePath } from "@/lib/design-tokens";

type AppShellProps = {
  activePath: RoutePath;
  children: ReactNode;
  subtitle?: string;
  title: string;
};

export function AppShell({ activePath, children, subtitle, title }: AppShellProps) {
  return (
    <div className={shellClassNames.page}>
      <Sidebar activePath={activePath} />

      <div className="min-h-screen md:pl-64">
        <Topbar subtitle={subtitle} title={title} />

        <main className="px-4 py-6 pb-28 md:px-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">{children}</div>
        </main>

        <footer className="hidden items-center justify-between bg-surface px-8 py-5 text-[10px] uppercase tracking-[0.32em] text-on-surface-variant md:flex">
          <p>ElimuCore v1.0.2 - Local Database: Connected</p>
          <div className="flex gap-6">
            <span>System Status</span>
            <span>Documentation</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

