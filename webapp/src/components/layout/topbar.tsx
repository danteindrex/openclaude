import { utilityActions } from "@/lib/demo-data";
import { designTokens, shellClassNames } from "@/lib/design-tokens";

type TopbarProps = {
  title: string;
  subtitle?: string;
};

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-surface px-5 py-4 md:px-8">
      <div className="space-y-1">
        <p className="font-headline text-lg font-bold tracking-tight text-primary md:text-xl">{title}</p>
        {subtitle ? <p className="text-sm text-on-surface-variant">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary shadow-neumorphic-inset sm:flex">
          Local Sync: 100%
        </div>
        {utilityActions.map((action) => (
          <button
            key={action.label}
            aria-label={action.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-neumorphic-raised transition-transform hover:scale-[1.03] active:scale-95"
            type="button"
          >
            <span className={shellClassNames.iconBadgeSmall}>
              {designTokens.iconMarks[action.icon as keyof typeof designTokens.iconMarks] ?? action.icon}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}

