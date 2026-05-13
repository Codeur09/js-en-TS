import { Type, type Static } from '@sinclair/typebox'

export const IdParam = Type.Object({
  id: Type.Integer(),
})

export const MessageSchema = Type.Object({
  id: Type.Integer(),
  conversationId: Type.Integer(),
  role: Type.Union([
    Type.Literal('user'),
    Type.Literal('assistant'),
    Type.Literal('system'),
  ]),
  content: Type.String(),
  createdAt: Type.String(),
})

export const ConversationSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  createdAt: Type.String(),
  messageCount: Type.Integer(),
})

export const ConversationDetailSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  createdAt: Type.String(),
  messages: Type.Array(MessageSchema),
})

export const SendMessageBody = Type.Object({
  message: Type.String({ minLength: 1, maxLength: 4096 }),
})

export type IdParamType = Static<typeof IdParam>
export type SendMessageBodyType = Static<typeof SendMessageBody>
