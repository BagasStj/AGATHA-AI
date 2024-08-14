import { StreamingTextResponse, LangChainStream } from 'ai'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { Langfuse } from 'langfuse-node';
import { PrismaClient } from '@prisma/client';
import { checkRateLimit, logRateLimitedRequest } from '@/lib/rateLimit';

export const runtime = 'edge'



export async function POST(req: Request) {
  const { messages, model, temperature, prompt, topP, presencePenalty, frequencyPenalty, maxTokens, traceId, userId ,username} = await req.json()

  if (!userId || !username) {
    return new Response("User ID is required for rate limiting", { status: 400 });
  }

  // const { success, limit, reset, remaining } = await checkRateLimit(userId, 'chat');

  // if (!success) {
  //   await logRateLimitedRequest(userId, username, 'chat');

  //   return new Response(JSON.stringify({
  //     message: "You have reached your request limit for the day.",
  //   }), {
  //     status: 429,
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-RateLimit-Limit": limit.toString(),
  //       "X-RateLimit-Remaining": remaining.toString(),
  //       "X-RateLimit-Reset": reset.toString(),
  //     },
  //   });
  // }

  const langfuse = process.env.LANGFUSE_SECRET_KEY
    ? new Langfuse({
      publicKey: process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL
    })
    : null;

  const trace = langfuse?.trace({ id: traceId });

  const llm = new ChatOpenAI({
    modelName: model || 'gpt-3.5-turbo',
    streaming: true,
    temperature: temperature ?? 0,
    topP: topP ?? 1,
    presencePenalty: presencePenalty ?? 0.9,
    frequencyPenalty: frequencyPenalty ?? 0.9,
    maxTokens: maxTokens ?? 150,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const { stream, handlers } = LangChainStream()

  const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  const systemMessage = new SystemMessage(prompt || `You are an AI assistant. Current time: ${currentTime}. You are operating with a temperature of ${llm.temperature}, topP of ${llm.topP}, presence penalty of ${llm.presencePenalty}, frequency penalty of ${llm.frequencyPenalty}, and max tokens of ${llm.maxTokens}.`)

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