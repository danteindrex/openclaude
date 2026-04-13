"use client";

import { useEffect, useMemo, useState } from "react";

import { ActivityPanel } from "@/components/tutor/activity-panel";
import { ChatComposer } from "@/components/tutor/chat-composer";
import { ChatMessage } from "@/components/tutor/chat-message";
import { FolderSwitcher } from "@/components/tutor/folder-switcher";
import { StatusPill } from "@/components/tutor/status-pill";
import type {
  TutorActivity,
  TutorMessage,
  TutorSessionSnapshot,
} from "@/lib/server/tutor-session-store";

type RuntimeStatus = {
  grpcReady: boolean;
  ollamaReady: boolean;
  model: string | null;
};

type ClientEvent =
  | { type: "text-delta"; text: string }
  | { type: "tool-start"; toolName: string; argumentsJson: string }
  | { type: "tool-result"; toolName: string; output: string; isError: boolean }
  | { type: "system"; text: string }
  | { type: "folder-changed"; folderPath: string }
  | { type: "done"; fullText: string }
  | { type: "error"; message: string };

function appendActivity(
  current: TutorActivity[],
  title: string,
  body: string,
  tone: TutorActivity["tone"] = "info",
) {
  return [
    {
      id: crypto.randomUUID(),
      title,
      body,
      tone,
      createdAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 60);
}

export function TutorScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [activities, setActivities] = useState<TutorActivity[]>([]);
  const [activeFolder, setActiveFolder] = useState("");
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/tutor/status")
      .then((response) => response.json())
      .then((payload: RuntimeStatus) => setRuntimeStatus(payload))
      .catch((error: Error) => setErrorMessage(error.message));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const response = await fetch("/api/tutor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = (await response.json()) as TutorSessionSnapshot;
      if (cancelled) {
        return;
      }
      setSessionId(payload.id);
      setMessages(payload.messages);
      setActivities(payload.activities);
      setActiveFolder(payload.activeFolder);
    }

    void ensureSession().catch((error: Error) => setErrorMessage(error.message));

    return () => {
      cancelled = true;
    };
  }, []);

  const canSend = Boolean(sessionId && runtimeStatus?.grpcReady && runtimeStatus?.ollamaReady);

  const headerCopy = useMemo(() => {
    if (!runtimeStatus) {
      return "Checking backend and Ollama status...";
    }
    if (!runtimeStatus.grpcReady) {
      return "OpenClaude gRPC backend is offline.";
    }
    if (!runtimeStatus.ollamaReady) {
      return "Ollama is offline or not reachable.";
    }
    return "Live tutoring is connected to OpenClaude and Ollama.";
  }, [runtimeStatus]);

  async function handleSend(message: string) {
    if (!sessionId) {
      return;
    }

    setSending(true);
    setErrorMessage(null);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: message, status: "done" },
      { id: crypto.randomUUID(), role: "assistant", text: "", status: "streaming" },
    ]);

    const response = await fetch(`/api/tutor/sessions/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Failed to send message" }));
      setErrorMessage(payload.error ?? "Failed to send message");
      setSending(false);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      setErrorMessage("Tutor stream unavailable.");
      setSending(false);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    const applyEvent = (payload: ClientEvent) => {
      if (payload.type === "system" && payload.text === "stream-ready") {
        return;
      }

      if (payload.type === "text-delta") {
        setMessages((current) => {
          const last = current[current.length - 1];
          if (last?.role === "assistant" && last.status === "streaming") {
            return [
              ...current.slice(0, -1),
              { ...last, text: last.text + payload.text, status: "streaming" },
            ];
          }

          return [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: payload.text,
              status: "streaming",
            },
          ];
        });
        return;
      }

      if (payload.type === "tool-start") {
        setActivities((current) =>
          appendActivity(current, `Running ${payload.toolName}`, payload.argumentsJson, "info"),
        );
        return;
      }

      if (payload.type === "tool-result") {
        setActivities((current) =>
          appendActivity(
            current,
            `${payload.toolName} ${payload.isError ? "failed" : "completed"}`,
            payload.output,
            payload.isError ? "error" : "success",
          ),
        );
        return;
      }

      if (payload.type === "system") {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "system",
            text: payload.text,
            status: "done",
          },
        ]);
        setActivities((current) => appendActivity(current, "System", payload.text, "info"));
        return;
      }

      if (payload.type === "folder-changed") {
        setActiveFolder(payload.folderPath);
        setActivities((current) =>
          appendActivity(current, "Folder switched", payload.folderPath, "success"),
        );
        return;
      }

      if (payload.type === "done") {
        setMessages((current) => {
          const last = current[current.length - 1];
          if (last?.role === "assistant") {
            const finalText =
              payload.fullText && payload.fullText.length >= last.text.length
                ? payload.fullText
                : last.text;
            return [
              ...current.slice(0, -1),
              { ...last, text: finalText, status: "done" },
            ];
          }
          return [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              text: payload.fullText,
              status: "done",
            },
          ];
        });
        setSending(false);
        return;
      }

      if (payload.type === "error") {
        setErrorMessage(payload.message);
        setSending(false);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame
          .split("\n")
          .find((entry) => entry.startsWith("data: "));

        if (!line) {
          continue;
        }

        const payload = JSON.parse(line.slice(6)) as ClientEvent;
        applyEvent(payload);
      }
    }
  }

  async function handleFolderSwitch(folderPath: string) {
    if (!sessionId || !folderPath) {
      return;
    }

    setErrorMessage(null);
    const response = await fetch(`/api/tutor/sessions/${sessionId}/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderPath }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setErrorMessage(payload.error ?? "Failed to switch folder");
      return;
    }

    setActiveFolder(payload.activeFolder);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden bg-surface-container-low p-6 shadow-neumorphic-soft md:flex md:flex-col">
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-black tracking-tight text-primary">
              ElimuCore
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-on-surface-variant">
              AI Tutor / ElimuBot
            </p>
          </div>

          <div className="space-y-3">
            <StatusPill
              label="Backend"
              tone={runtimeStatus?.grpcReady ? "good" : "bad"}
              value={runtimeStatus?.grpcReady ? "online" : "offline"}
            />
            <StatusPill
              label="Ollama"
              tone={runtimeStatus?.ollamaReady ? "good" : "bad"}
              value={runtimeStatus?.ollamaReady ? "ready" : "down"}
            />
            <StatusPill label="Model" value={runtimeStatus?.model ?? "unset"} />
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-surface-container-lowest p-5 shadow-neumorphic-raised">
            <h2 className="font-headline text-lg font-bold">Demo Login</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Username: <strong className="text-on-surface">student-demo</strong>
              <br />
              Password: <strong className="text-on-surface">elimu123</strong>
            </p>
          </div>
        </aside>

        <main className="grid min-h-screen grid-cols-1 gap-6 p-4 md:grid-cols-[minmax(0,1fr)_22rem] md:p-6">
          <section className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 rounded-[2rem] bg-surface-container p-5 shadow-neumorphic-inset">
            <header className="rounded-[1.75rem] bg-surface-container-lowest px-5 py-4 shadow-neumorphic-raised">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-headline text-2xl font-black tracking-tight text-primary">
                    ElimuBot Live Tutor
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{headerCopy}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill
                    label="Backend"
                    tone={runtimeStatus?.grpcReady ? "good" : "bad"}
                    value={runtimeStatus?.grpcReady ? "online" : "offline"}
                  />
                  <StatusPill
                    label="Ollama"
                    tone={runtimeStatus?.ollamaReady ? "good" : "bad"}
                    value={runtimeStatus?.ollamaReady ? "ready" : "down"}
                  />
                </div>
              </div>
            </header>

            <div className="hide-scrollbar flex-1 space-y-4 overflow-y-auto rounded-[1.75rem] bg-surface-container-low p-4 shadow-neumorphic-inset">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {errorMessage ? (
              <div className="rounded-[1.5rem] bg-error-container px-4 py-3 text-sm text-error shadow-neumorphic-raised">
                {errorMessage}
              </div>
            ) : null}

            <ChatComposer disabled={!canSend || sending} onSubmit={handleSend} />
          </section>

          <aside className="space-y-5">
            <FolderSwitcher activeFolder={activeFolder} onSubmit={handleFolderSwitch} />
            <div className="rounded-[1.75rem] bg-surface-container-lowest p-5 shadow-neumorphic-raised">
              <h3 className="font-headline text-lg font-bold">How to test</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-on-surface-variant">
                <li>Ask it to explain a file in the active folder.</li>
                <li>Ask it to list files or run a command.</li>
                <li>Switch the active folder, then ask a follow-up.</li>
              </ul>
            </div>
            <ActivityPanel activities={activities} />
          </aside>
        </main>
      </div>
    </div>
  );
}
