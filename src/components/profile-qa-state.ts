export type QaStatus = "idle" | "loading" | "error" | "success";

type GenerationStrategy = "golden-match" | "template" | "ollama";

interface QADetail {
  text: string;
  section: string;
  similarity: number;
}

export interface QAResult {
  answer: string;
  details: QADetail[];
  strategy?: GenerationStrategy;
  ollamaError?: string;
}

export interface QaState {
  question: string;
  status: QaStatus;
  result: QAResult | null;
  error: string | null;
  activeQuestion: string | null;
}

export type QaAction =
  | { type: "SET_QUESTION"; question: string }
  | { type: "SUBMIT_START"; question: string }
  | { type: "SUBMIT_SUCCESS"; result: QAResult }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SELECT_SUGGESTED_QUESTION"; question: string }
  | { type: "RESET" };

export const initialQaState: QaState = {
  question: "",
  status: "idle",
  result: null,
  error: null,
  activeQuestion: null,
};

function submitStartState(state: QaState, question: string): QaState {
  return {
    ...state,
    question,
    activeQuestion: question,
    status: "loading",
    result: null,
    error: null,
  };
}

export function qaReducer(state: QaState, action: QaAction): QaState {
  switch (action.type) {
    case "SET_QUESTION":
      return { ...state, question: action.question };
    case "SUBMIT_START":
      return submitStartState(state, action.question);
    case "SELECT_SUGGESTED_QUESTION":
      return submitStartState(state, action.question);
    case "SUBMIT_SUCCESS":
      return { ...state, status: "success", result: action.result };
    case "SUBMIT_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initialQaState;
    default:
      return state;
  }
}

export async function fetchQaAnswer(question: string): Promise<QAResult> {
  const response = await fetch("/api/cv/qa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("Failed to get answer");
  }

  return response.json() as Promise<QAResult>;
}
