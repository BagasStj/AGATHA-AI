'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Message, useChat } from 'ai/react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'

export default function AIChat() {
    const [chatHistory, setChatHistory] = useState<{ id: string; title: string; messages: any[]; timestamp: number; prompt: string }[]>([])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [prompt, setPrompt] = useState<string>('You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.')

    // const [chatHistory, setChatHistory] = useState([])
    // const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
    // const [prompt, setPrompt] = useState('')
    const [temperature, setTemperature] = useState(0.5)
    const [topP, setTopP] = useState(1)
    const [presencePenalty, setPresencePenalty] = useState(0)
    const [frequencyPenalty, setFrequencyPenalty] = useState(0)
    const [maxTokens, setMaxTokens] = useState(2048)
    const [title, setTitle] = useState<string>('')
    const [inputs, setInputs] = useState<string>('')

    const fetchChatResponse = async (input: string) => {
        try {
            const response = await fetch('/api/chat-flowise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: input }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching chat response:', error);
            return null;
        }
    };

    const { messages, input, handleSubmit, isLoading, setMessages, setInput } = useChat({
        api: '/api/chat-flowise',
        id: currentChatId ?? undefined,
        body: {
            question: inputs
        },
        onFinish: (message) => {
            console.log('onFinish called with message:', message);
            const assistantMessage: Message = { ...message, role: 'assistant' as const };
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
            if (currentChatId) {
                setChatHistory(prev => {
                    const newHistory = prev.map(chat =>
                        chat.id === currentChatId
                            ? { ...chat, messages: [...chat.messages, assistantMessage], title: chat.messages[0].content.slice(0, 30) }
                            : chat
                    );
                    console.log('Updated chat history:', newHistory);
                    return newHistory;
                });
            }
        },
    });


    const handleSubmitWrapper = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        const response = await fetchChatResponse(input);
        if (response) {
            const assistantMessage: Message = {
                role: 'assistant',
                content: response.content,
                id: Date.now().toString()
            };
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }

        setInput('');
        setInputs('');
    };

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
        // setPrompt('')
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
        setInputs(value)
    }

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth > 768)
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
    const [currentTitle, setCurrentTitle] = useState("Chat AI Flowise");


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
                    title={title}
                    setTitle={setTitle}
                    setCurrentPrompt={setCurrentPrompt}
                    setCurrentTitle={setCurrentTitle}
                />
                <ChatArea
                    messages={messages}
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmitWrapper}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    title={currentTitle}
                />
            </div>
        </>
    )
}