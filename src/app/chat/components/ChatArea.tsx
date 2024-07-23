import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SendIcon, MenuIcon, UserIcon, MicIcon } from 'lucide-react'
import { useState } from 'react'

type ChatAreaProps = {
  messages: any[]
  input: string
//   handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleInputChange: (value: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function ChatArea({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messagesEndRef,
  sidebarOpen,
  setSidebarOpen
}: ChatAreaProps) {

    const [isListening, setIsListening] = useState(false)

    const startListening = () => {
        setIsListening(true)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = false
    
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          handleInputChange(transcript)
        }
    
        recognition.onend = () => {
          setIsListening(false)
        }
    
        recognition.start()
      }
    
  
  return (
    <main className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
    <header className="border-b border-gray-200 p-4">
      <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="ghost" className="text-gray-500 md:hidden">
        <MenuIcon className="h-5 w-5" />
      </Button>
    </header>
    <div className="flex-grow flex flex-col">
      <ScrollArea className="flex-grow pt-4">
        <div className="max-w-2xl mx-auto py-4 px-4">
          {messages.map(m => (
            <div key={m.id} className={`mb-6 ${m.role === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`flex items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === 'user' ? 'bg-gray-200 ml-4' : 'mr-4'
                }`} style={m.role === 'user' ? {} : { backgroundColor: 'rgb(0 0 0)', color: 'white' }}>
                  {m.role === 'user' ? <UserIcon className="w-5 h-5 text-gray-600" /> : 'AI'}
                </div>
                <div className="flex-grow">
                  <div className="text-sm font-semibold mb-1"> 
                  </div>
                  <div className="text-gray-800">{m.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      </div>
      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
        <Input
      value={input}
      onChange={(e) => handleInputChange(e.target.value)}
      placeholder="Send a message"
      className="w-full bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-800 pr-24 shadow-sm"
    />
          <Button
            type="button"
            onClick={startListening}
            disabled={isListening}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100"
          >
            <MicIcon className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
          </Button>
          <Button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100">
            <SendIcon className="h-5 w-5 text-gray-500" />
          </Button>
        </form>
      </footer>
    </main>
  )
}