import { StreamingTextResponse, LangChainStream } from 'ai'
import { ChatOpenAI } from '@langchain/openai' 
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, model } = await req.json()
  const { stream, handlers } = LangChainStream()

  const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  
  const llm = new ChatOpenAI({
    modelName: model,
    streaming: true,
    temperature: 0, 
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const systemMessage = new SystemMessage(`Anda adalah asisten AI. Waktu saat ini di Indonesia adalah ${currentTime}.`)

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