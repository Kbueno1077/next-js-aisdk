import { UIMessage } from "ai";
import { z } from "zod";

export const MessageMetadata = z.object({
  createdAt: z.number().optional(),
  totalTokens: z.number().optional(),
});

export type MessageMetadata = z.infer<typeof MessageMetadata>;
export type UIMessageMetadata = UIMessage<MessageMetadata>;
