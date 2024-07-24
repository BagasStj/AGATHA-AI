import { StreamingTextResponse, LangChainStream } from 'ai'
import { ChatOpenAI } from '@langchain/openai' 
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages, model, temperature, prompt, topP, presencePenalty, frequencyPenalty, maxTokens } = await req.json()
  const { stream, handlers } = LangChainStream()

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

  
  
  const systemMessage = new SystemMessage(prompt || ` You are operating with a temperature of ${temperature}, topP of ${topP}, presence penalty of ${presencePenalty}, frequency penalty of ${frequencyPenalty}, and max tokens of ${maxTokens}.`)
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