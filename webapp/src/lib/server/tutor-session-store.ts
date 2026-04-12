import { randomUUID } from "node:crypto";

import { type AgentStream, openAgentStream } from "@/lib/grpc/client";
import {
  mapServerMessage,
  type TutorBrowserEvent,
} from "@/lib/server/tutor-event-map";

export type TutorMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  status?: "streaming" | "done" | "error";
};

export type TutorActivity = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "error";
  createdAt: string;
};

export type TutorSessionSnapshot = {
  id: string;
  title: string;
  activeFolder: string;
  messages: TutorMessage[];
  activities: TutorActivity[];
  lastError: string | null;
  model: string | null;
};

type Subscriber = (event: TutorBrowserEvent) => void;

type TutorSessionState = TutorSessionSnapshot & {
  stream: AgentStream | null;
  subscribers: Set<Subscriber>;
  pendingAssistantMessageId: string | null;
};

function getSessionLimit() {
  return 50;
}

function createState(id: string, activeFolder: string): TutorSessionState {
  return {
    id,
    title: "New Tutor Session",
    activeFolder,
    messages: [
      {
        id: randomUUID(),
        role: "assistant",
        text:
          "ElimuBot is ready. Ask a question, switch folders, or let me inspect your codebase.",
        status: "done",
      },
    ],
    activities: [],
    lastError: null,
    model: process.env.OPENAI_MODEL ?? null,
    stream: null,
    subscribers: new Set(),
    pendingAssistantMessageId: null,
  };
}

function addActivity(
  session: TutorSessionState,
  title: string,
  body: string,
  tone: TutorActivity["tone"] = "info",
) {
  session.activities.unshift({
    id: randomUUID(),
    title,
    body,
    tone,
    createdAt: new Date().toISOString(),
  });
  session.activities = session.activities.slice(0, 60);
}

function emit(session: TutorSessionState, event: TutorBrowserEvent) {
  for (const subscriber of session.subscribers) {
    subscriber(event);
  }
}

function ensureAssistantDraft(session: TutorSessionState) {
  if (session.pendingAssistantMessageId) {
    return session.pendingAssistantMessageId;
  }

  const id = randomUUID();
  session.pendingAssistantMessageId = id;
  session.messages.push({
    id,
    role: "assistant",
    text: "",
    status: "streaming",
  });
  return id;
}

function getAssistantDraft(session: TutorSessionState) {
  if (!session.pendingAssistantMessageId) {
    return null;
  }

  return (
    session.messages.find((message) => message.id === session.pendingAssistantMessageId) ?? null
  );
}

function handleMappedEvent(session: TutorSessionState, event: TutorBrowserEvent) {
  switch (event.type) {
    case "text-delta": {
      const draftId = ensureAssistantDraft(session);
      const draft = session.messages.find((message) => message.id === draftId);
      if (draft) {
        draft.text += event.text;
        draft.status = "streaming";
      }
      break;
    }
    case "tool-start":
      addActivity(session, `Running ${event.toolName}`, event.argumentsJson, "info");
      break;
    case "tool-result":
      addActivity(
        session,
        `${event.toolName} ${event.isError ? "failed" : "completed"}`,
        event.output,
        event.isError ? "error" : "success",
      );
      break;
    case "system":
      session.messages.push({
        id: randomUUID(),
        role: "system",
        text: event.text,
        status: "done",
      });
      addActivity(session, "System", event.text, "info");
      break;
    case "folder-changed":
      addActivity(session, "Folder switched", event.folderPath, "success");
      break;
    case "done": {
      const draft = getAssistantDraft(session);
      if (draft) {
        draft.text = event.fullText || draft.text;
        draft.status = "done";
      } else {
        session.messages.push({
          id: randomUUID(),
          role: "assistant",
          text: event.fullText,
          status: "done",
        });
      }
      session.pendingAssistantMessageId = null;
      addActivity(
        session,
        "Response complete",
        `Prompt tokens: ${event.promptTokens ?? 0}\nCompletion tokens: ${
          event.completionTokens ?? 0
        }`,
        "success",
      );
      break;
    }
    case "error": {
      const draft = getAssistantDraft(session);
      if (draft) {
        draft.status = "error";
      }
      session.pendingAssistantMessageId = null;
      session.lastError = event.message;
      addActivity(session, "Backend error", event.message, "error");
      break;
    }
  }

  emit(session, event);
}

function ensureStream(session: TutorSessionState) {
  if (session.stream) {
    return session.stream;
  }

  session.stream = openAgentStream({
    onMessage(message) {
      if (message.action_required) {
        const mapped = mapServerMessage(session.id, message);
        if (mapped) {
          handleMappedEvent(session, mapped);
        }

        const question = message.action_required.question ?? "approve action";
        addActivity(session, "Permission auto-approved", question, "info");
        session.stream?.sendReply(message.action_required.prompt_id, "y");
        return;
      }

      const mapped = mapServerMessage(session.id, message);
      if (mapped) {
        handleMappedEvent(session, mapped);
      }
    },
    onError(error) {
      handleMappedEvent(session, {
        type: "error",
        sessionId: session.id,
        message: error.message,
      });
    },
    onClose() {
      session.stream = null;
    },
  });

  return session.stream;
}

type StoreShape = {
  sessions: Map<string, TutorSessionState>;
};

function getStore(): StoreShape {
  const globalState = globalThis as typeof globalThis & {
    __elimucoreTutorStore?: StoreShape;
  };

  if (!globalState.__elimucoreTutorStore) {
    globalState.__elimucoreTutorStore = {
      sessions: new Map<string, TutorSessionState>(),
    };
  }

  return globalState.__elimucoreTutorStore;
}

export function createTutorSession(activeFolder: string) {
  const store = getStore();
  const id = randomUUID();
  const session = createState(id, activeFolder);

  if (store.sessions.size >= getSessionLimit()) {
    const firstKey = store.sessions.keys().next().value;
    if (firstKey) {
      const doomed = store.sessions.get(firstKey);
      doomed?.stream?.close();
      store.sessions.delete(firstKey);
    }
  }

  store.sessions.set(id, session);
  return getTutorSessionSnapshot(id);
}

export function getTutorSessionState(id: string) {
  return getStore().sessions.get(id) ?? null;
}

export function getTutorSessionSnapshot(id: string): TutorSessionSnapshot | null {
  const session = getTutorSessionState(id);
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    title: session.title,
    activeFolder: session.activeFolder,
    messages: [...session.messages],
    activities: [...session.activities],
    lastError: session.lastError,
    model: session.model,
  };
}

export function subscribeToTutorSession(id: string, subscriber: Subscriber) {
  const session = getTutorSessionState(id);
  if (!session) {
    return () => {};
  }

  session.subscribers.add(subscriber);
  return () => {
    session.subscribers.delete(subscriber);
  };
}

export function updateTutorSessionFolder(id: string, folderPath: string) {
  const session = getTutorSessionState(id);
  if (!session) {
    return null;
  }

  session.activeFolder = folderPath;
  const event: TutorBrowserEvent = {
    type: "folder-changed",
    sessionId: id,
    folderPath,
  };
  handleMappedEvent(session, event);
  return getTutorSessionSnapshot(id);
}

export function sendTutorMessage(id: string, message: string) {
  const session = getTutorSessionState(id);
  if (!session) {
    throw new Error("Session not found");
  }

  session.messages.push({
    id: randomUUID(),
    role: "user",
    text: message,
    status: "done",
  });
  session.title =
    session.title === "New Tutor Session" ? message.slice(0, 48) || "New Tutor Session" : session.title;
  session.lastError = null;
  session.pendingAssistantMessageId = null;
  addActivity(session, "Prompt submitted", message, "info");
  ensureStream(session).sendPrompt({
    message,
    sessionId: session.id,
    workingDirectory: session.activeFolder,
    model: session.model,
  });
  return getTutorSessionSnapshot(id);
}

export function resetTutorStoreForTests() {
  const store = getStore();
  for (const session of store.sessions.values()) {
    session.stream?.close();
  }
  store.sessions.clear();
}
