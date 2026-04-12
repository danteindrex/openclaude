"use client";

import { useState } from "react";

export function ChatComposer({
  disabled,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="rounded-[1.75rem] bg-surface-container-low p-3 shadow-neumorphic-inset"
      onSubmit={async (event) => {
        event.preventDefault();
        const nextValue = value.trim();
        if (!nextValue) {
          return;
        }
        setValue("");
        await onSubmit(nextValue);
      }}
    >
      <div className="flex items-end gap-3">
        <textarea
          className="min-h-[88px] flex-1 resize-none border-none bg-transparent px-4 py-3 text-sm leading-7 text-on-surface outline-none placeholder:text-outline"
          disabled={disabled}
          placeholder="Ask ElimuBot to inspect code, run commands, explain a file, or switch focus."
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          className="rounded-[1.35rem] bg-primary-gradient px-6 py-4 text-sm font-bold text-white shadow-neumorphic-raised transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
