import { Type, type Static } from '@sinclair/typebox'

export const ChatBody = Type.Object({
  message: Type.String({ minLength: 1, maxLength: 4096 }),
})

export const ChatResponse = Type.Object({
  response: Type.String(),
})

export const ErrorResponse = Type.Object({
  error: Type.String(),
})

export type ChatBodyType = Static<typeof ChatBody>
