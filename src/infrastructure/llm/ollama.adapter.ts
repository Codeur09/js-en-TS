import { config } from '../../config/env.js'
import type { LLMPort, LLMChunk } from '../../domain/ports/out/llm.port.js'
import type { OllamaMessage } from '../../domain/entities/message.entity.js'

export class OllamaAdapter implements LLMPort {
  async chat(messages: OllamaMessage[], signal?: AbortSignal): Promise<string> {
    const res = await this.call(messages, false, signal)
    const data = (await res.json()) as { message: { content: string } }
    return data.message.content
  }

  async *stream(messages: OllamaMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    const res = await this.call(messages, true, signal)
    if (!res.body) return

    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      const lines = Buffer.from(chunk).toString('utf8').split('\n').filter(Boolean)
      for (const line of lines) {
        const parsed = JSON.parse(line) as { message?: { content: string }; done: boolean }
        yield { content: parsed.message?.content, done: parsed.done }
      }
    }
  }

  private async call(
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

    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`)
    return res
  }
}
