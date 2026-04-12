import type { TutorActivity } from "@/lib/server/tutor-session-store";

function formatActivityTime(createdAt: string) {
  const date = new Date(createdAt);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes} UTC`;
}

export function ActivityPanel({ activities }: { activities: TutorActivity[] }) {
  return (
    <section className="rounded-[2rem] bg-surface-container-low p-5 shadow-neumorphic-inset">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold">Agent Activity</h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
          live
        </span>
      </div>

      <div className="hide-scrollbar flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="rounded-[1.4rem] bg-surface-container-lowest p-4 text-sm text-on-surface-variant shadow-neumorphic-raised">
            Tool calls, command output, file reads, and folder switches will appear here.
          </div>
        ) : null}

        {activities.map((activity) => (
          <article
            key={activity.id}
            className={`rounded-[1.4rem] p-4 shadow-neumorphic-raised ${
              activity.tone === "error"
                ? "bg-error-container text-error"
                : "bg-surface-container-lowest text-on-surface"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-4">
              <h4 className="text-sm font-bold">{activity.title}</h4>
              <span className="text-[10px] uppercase tracking-[0.22em] opacity-60">
                {formatActivityTime(activity.createdAt)}
              </span>
            </div>
            <pre className="whitespace-pre-wrap break-words text-xs leading-6">
              {activity.body}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
