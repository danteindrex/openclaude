import type { TutorMessage } from "@/lib/server/tutor-session-store";
import AILoadingState from "./ai-loading-state";

export function ChatMessage({ message }: { message: TutorMessage }) {
  if (message.role === "assistant" && message.status === "streaming" && !message.text) {
    return <AILoadingState />;
  }

  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const className = isSystem
    ? "mx-auto max-w-xl rounded-full bg-surface-container px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant shadow-neumorphic-inset"
    : isUser
      ? "ml-auto max-w-2xl rounded-[1.75rem] rounded-br-md bg-primary-gradient px-5 py-4 text-white shadow-neumorphic-raised"
      : "max-w-3xl rounded-[1.75rem] rounded-bl-md bg-surface-container-lowest px-5 py-4 text-on-surface shadow-neumorphic-raised";

  return (
    <article className={className}>
      <p className="whitespace-pre-wrap text-sm leading-7">
        {message.text}
      </p>
    </article>
  );
}
