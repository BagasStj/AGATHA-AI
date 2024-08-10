import { StreamingTextResponse, LangChainStream } from 'ai'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

export const runtime = 'edge'

import { Langfuse } from 'langfuse-node';

export async function POST(req: Request) {
  const { messages, model, temperature, prompt, topP, presencePenalty, frequencyPenalty, maxTokens, traceId } = await req.json()
  const { stream, handlers } = LangChainStream()

  const langfuse = process.env.LANGFUSE_SECRET_KEY
    ? new Langfuse({
      publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL // optional
    })
    : null;

  const trace = langfuse?.trace({ id: traceId });

  const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

  const llm = new ChatOpenAI({
    modelName: model || 'gpt-3.5-turbo',
    streaming: true,
    temperature: temperature !== undefined ? temperature : 0,
    topP: topP !== undefined ? topP : 1,
    presencePenalty: presencePenalty !== undefined ? presencePenalty : 0.9,
    frequencyPenalty: frequencyPenalty !== undefined ? frequencyPenalty : 0.9,
    maxTokens: maxTokens !== undefined ? maxTokens : 2500,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  if (langfuse && trace) {
    trace.generation({
      name: 'chat_request',
      startTime: new Date(),
      endTime: new Date(),
      model: llm.modelName,
      modelParameters: {
        temperature: llm.temperature,
        topP: llm.topP,
        presencePenalty: llm.presencePenalty,
        frequencyPenalty: llm.frequencyPenalty,
        maxTokens: llm.maxTokens,
      },
      prompt: messages[messages.length - 1].content,
    });
  }


  const systemMessage = new SystemMessage(prompt || `You are an AI assistant. Current time: ${currentTime}. You are operating with a temperature of ${temperature}, topP of ${topP}, presence penalty of ${presencePenalty}, frequency penalty of ${frequencyPenalty}, and max tokens of ${maxTokens}.`)

  llm.call(
    [
      systemMessage,
      ...messages.map((m: any) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      )
    ],
    {},
    [handlers]
  )

  return new StreamingTextResponse(stream)
}