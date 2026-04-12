"use client";

import { useEffect, useState } from "react";

export function FolderSwitcher({
  activeFolder,
  onSubmit,
}: {
  activeFolder: string;
  onSubmit: (folderPath: string) => Promise<void>;
}) {
  const [value, setValue] = useState(activeFolder);

  useEffect(() => {
    setValue(activeFolder);
  }, [activeFolder]);

  return (
    <form
      className="rounded-[1.75rem] bg-surface-container-low p-4 shadow-neumorphic-inset"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(value.trim());
      }}
    >
      <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        Active Folder
      </label>
      <div className="flex gap-3">
        <input
          className="w-full rounded-[1.15rem] border-none bg-surface-container-lowest px-4 py-3 text-sm outline-none shadow-neumorphic-raised"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          className="rounded-[1.15rem] bg-primary-gradient px-4 py-3 text-sm font-bold text-white shadow-neumorphic-raised"
          type="submit"
        >
          Switch
        </button>
      </div>
    </form>
  );
}
