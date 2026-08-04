import type { ChatMessage, Conversation, MockAnswer } from "@/lib/types";
import { MOCK_ANSWERS, getAnswerById } from "./answers";

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq.toString().padStart(3, "0")}`;
}

function userMessage(content: string, createdAt: string): ChatMessage {
  return { id: nextId("msg"), role: "user", content, createdAt };
}

function assistantMessage(answer: MockAnswer, createdAt: string): ChatMessage {
  return {
    id: nextId("msg"),
    role: "assistant",
    content: answer.answer,
    createdAt,
    steps: answer.steps,
    sources: answer.sources,
    totalMs: answer.totalMs,
    usedFallback: answer.usedFallback,
  };
}

/** Dựng một cặp hỏi–đáp hoàn chỉnh từ mock answer. */
function turn(answerId: string, at: string, question?: string): ChatMessage[] {
  const answer = getAnswerById(answerId) ?? MOCK_ANSWERS[0];
  return [
    userMessage(question ?? answer.question, at),
    assistantMessage(answer, at),
  ];
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_return_policy",
    title: "Thời hạn & bằng chứng hoàn tiền",
    updatedAt: "2026-08-04T09:42:00+07:00",
    pinned: true,
    messages: [
      ...turn("ans_return_deadline", "2026-08-04T09:38:00+07:00"),
      ...turn("ans_refund_evidence", "2026-08-04T09:42:00+07:00"),
    ],
  },
  {
    id: "conv_payment",
    title: "Phương thức thanh toán Shopee",
    updatedAt: "2026-08-03T16:20:00+07:00",
    messages: [...turn("ans_payment_methods", "2026-08-03T16:20:00+07:00")],
  },
  {
    id: "conv_seller_rules",
    title: "Quy định đăng bán cho Người bán",
    updatedAt: "2026-08-03T11:05:00+07:00",
    messages: [...turn("ans_prohibited_items", "2026-08-03T11:05:00+07:00")],
  },
  {
    id: "conv_fallback_demo",
    title: "Đổi trả vé máy bay (PageIndex fallback)",
    updatedAt: "2026-08-02T20:14:00+07:00",
    messages: [...turn("ans_fallback_travel", "2026-08-02T20:14:00+07:00")],
  },
  {
    id: "conv_cross_border",
    title: "Theo dõi đơn hàng quốc tế",
    updatedAt: "2026-08-01T14:47:00+07:00",
    messages: [...turn("ans_cross_border", "2026-08-01T14:47:00+07:00")],
  },
];

export function createEmptyConversation(): Conversation {
  return {
    id: nextId("conv"),
    title: "Cuộc trò chuyện mới",
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: nextId("msg"),
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createPendingAssistantMessage(): ChatMessage {
  return {
    id: nextId("msg"),
    role: "assistant",
    content: "",
    createdAt: new Date().toISOString(),
    steps: [],
    sources: [],
    streaming: true,
    revealedSteps: 0,
  };
}
