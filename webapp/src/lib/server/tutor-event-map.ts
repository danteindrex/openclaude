export type TutorBrowserEvent =
  | { type: "text-delta"; sessionId: string; text: string }
  | { type: "tool-start"; sessionId: string; toolName: string; argumentsJson: string }
  | {
      type: "tool-result";
      sessionId: string;
      toolName: string;
      output: string;
      isError: boolean;
    }
  | { type: "system"; sessionId: string; text: string }
  | { type: "folder-changed"; sessionId: string; folderPath: string }
  | {
      type: "done";
      sessionId: string;
      fullText: string;
      promptTokens?: number;
      completionTokens?: number;
    }
  | { type: "error"; sessionId: string; message: string };

export function mapServerMessage(
  sessionId: string,
  serverMessage: any,
): TutorBrowserEvent | null {
  if (serverMessage.text_chunk) {
    return {
      type: "text-delta",
      sessionId,
      text: serverMessage.text_chunk.text ?? "",
    };
  }

  if (serverMessage.tool_start) {
    return {
      type: "tool-start",
      sessionId,
      toolName: serverMessage.tool_start.tool_name ?? "Tool",
      argumentsJson: serverMessage.tool_start.arguments_json ?? "{}",
    };
  }

  if (serverMessage.tool_result) {
    return {
      type: "tool-result",
      sessionId,
      toolName: serverMessage.tool_result.tool_name ?? "Tool",
      output: serverMessage.tool_result.output ?? "",
      isError: Boolean(serverMessage.tool_result.is_error),
    };
  }

  if (serverMessage.action_required) {
    return {
      type: "system",
      sessionId,
      text: `Auto-approved ${serverMessage.action_required.question ?? "action"}`,
    };
  }

  if (serverMessage.done) {
    return {
      type: "done",
      sessionId,
      fullText: serverMessage.done.full_text ?? "",
      promptTokens: serverMessage.done.prompt_tokens,
      completionTokens: serverMessage.done.completion_tokens,
    };
  }

  if (serverMessage.error) {
    return {
      type: "error",
      sessionId,
      message: serverMessage.error.message ?? "Unknown backend error",
    };
  }

  return null;
}
