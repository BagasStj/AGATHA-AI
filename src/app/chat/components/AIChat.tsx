'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'

export default function AIChat() {
    const [chatHistory, setChatHistory] = useState<{ id: string; title: string; messages: any[]; timestamp: number; prompt: string }[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [prompt, setPrompt] = useState<string>('')

    // const [chatHistory, setChatHistory] = useState([])
    // const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    // const [prompt, setPrompt] = useState('')
    const [temperature, setTemperature] = useState(0.7)
    const [topP, setTopP] = useState(1)
    const [presencePenalty, setPresencePenalty] = useState(0)
    const [frequencyPenalty, setFrequencyPenalty] = useState(0)
    const [maxTokens, setMaxTokens] = useState(2048)

    

    const { messages, input, handleSubmit, isLoading, reload, setMessages, setInput } = useChat({
        api: '/api/chat',
        id: currentChatId ?? undefined,
        body: { model, prompt },
        onFinish: (message) => {
            if (currentChatId) {
                setChatHistory(prev => prev.map(chat => 
                    chat.id === currentChatId 
                        ? { ...chat, messages: [...chat.messages, message], title: chat.messages[0].content.slice(0, 30) }
                        : chat
                ))
            }
        }
    })

    const messagesEndRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => { 
        setInput('')
    }, [currentChatId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startNewChat = () => {
        if (messages.length > 0) {
            setChatHistory(prev => [...prev, { 
                id: currentChatId || Date.now().toString(), 
                title: messages[0].content.slice(0, 30), 
                messages,
                timestamp: Date.now(),
                prompt
            }])
        }
        
        setMessages([])
        setCurrentChatId(Date.now().toString())
        setPrompt('')
    }

    const loadChat = (chatId: string) => {
        const chat = chatHistory.find(c => c.id === chatId)
        if (chat) {
            setCurrentChatId(chatId)
            setMessages(chat.messages)
            setInput('')
            setPrompt(chat.prompt)
        }
    }

    const handleInputChange = (value: string) => {
        setInput(value)
    }

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth > 768)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <>
            <div className="flex h-[85vh] m-4 -mt-[3px]">
                <Sidebar
                    chatHistory={chatHistory}
                    startNewChat={startNewChat}
                    loadChat={loadChat}
                    model={model}
                    setModel={setModel}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    temperature={temperature}
                setTemperature={setTemperature}
                topP={topP}
                setTopP={setTopP}
                presencePenalty={presencePenalty}
                setPresencePenalty={setPresencePenalty}
                frequencyPenalty={frequencyPenalty}
                setFrequencyPenalty={setFrequencyPenalty}
                maxTokens={maxTokens}
                setMaxTokens={setMaxTokens}
                />
                <ChatArea
                    messages={messages}
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>
        </>
    )
}