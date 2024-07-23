'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'

export default function AIChat() {
    const [chatHistory, setChatHistory] = useState<{ id: string; title: string; messages: any[]; timestamp: number }[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [model, setModel] = useState<'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'>('gpt-3.5-turbo')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const { messages, input, handleSubmit, isLoading, reload, setMessages , setInput} = useChat({
    api: '/api/chat',
    id: currentChatId ?? undefined,
    body: { model },
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
    // Simpan chat saat ini ke history jika ada pesan
    if (messages.length > 0) {
      setChatHistory(prev => [...prev, { 
        id: currentChatId || Date.now().toString(), 
        title: messages[0].content.slice(0, 30), 
        messages,
        timestamp: Date.now()
      }])
    }
    
    // Reset state untuk chat baru
    setMessages([])
    setCurrentChatId(Date.now().toString())
  }

 
  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
      setInput('') // Reset input when loading a chat
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
  }

  return (
    <>
    <div className="flex h-[85vh] m-4 -mt-[3px]">
      {sidebarOpen && (
        <Sidebar
        chatHistory={chatHistory}
        startNewChat={startNewChat}
        loadChat={loadChat}
        model={model}
        setModel={setModel}
      />
      )}
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