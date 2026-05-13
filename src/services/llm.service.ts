import { config } from '../config/env.js'
import type { OllamaMessage } from '../types/domain.js'

interface OllamaChunk {
  message?: { content: string }
  done: boolean
}

export class LLMError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string
  ) {
    super(`Ollama error ${statusCode}`)
    this.name = 'LLMError'
  }
}

export class LLMService {
  async chat(messages: OllamaMessage[], signal?: AbortSignal): Promise<string> {
    const res = await this.callOllama(messages, false, signal)
    const data = (await res.json()) as { message: { content: string } }
    return data.message.content
  }

  async *stream(
    messages: OllamaMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<OllamaChunk> {
    const res = await this.callOllama(messages, true, signal)
    if (!res.body) return

    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      const lines = Buffer.from(chunk).toString('utf8').split('\n').filter(Boolean)
      for (const line of lines) {
        yield JSON.parse(line) as OllamaChunk
      }
    }
  }

  private async callOllama(
    messages: OllamaMessage[],
    stream: boolean,
    signal?: AbortSignal
  ): Promise<Response> {
    const res = await fetch(`${config.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({ model: config.ollamaModel, messages, stream }),
    })

    if (!res.ok) {
      throw new LLMError(res.status, await res.text())
    }

    return res
  }
}
