import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusIcon, ClockIcon, HashIcon, XIcon } from 'lucide-react'

type SidebarProps = {
    chatHistory: { id: string; title: string; messages: any[]; timestamp: number | string }[]
    startNewChat: () => void
    loadChat: (chatId: string) => void
    model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'
    setModel: (model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k') => void
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ chatHistory, startNewChat, loadChat, model, setModel, isOpen, onClose }: SidebarProps) {
    const formatDate = (timestamp: number | string) => {
        if (typeof timestamp === 'number') { 
          const date = new Date(timestamp);
          return isNaN(date.getTime()) ? `Invalid Date (number: ${timestamp})` : date.toLocaleString();
        } else if (typeof timestamp === 'string') { 
          const date = new Date(timestamp);
          return isNaN(date.getTime()) ? `Invalid Date (string: ${timestamp})` : date.toLocaleString();
        } else {
          return `Invalid timestamp type: ${typeof timestamp}`;
        }
      }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-800 p-4 flex flex-col border border-gray-200 rounded-lg mr-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={startNewChat} className="bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
          <PlusIcon className="mr-2 h-4 w-4" /> New chat
        </Button>
        <Button onClick={onClose} variant="ghost" className="md:hidden">
          <XIcon className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        {chatHistory.map((chat) => (
          <div key={chat.id} className="mb-2">
            <Button
              variant="ghost"
              className="w-full justify-start mb-1 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => loadChat(chat.id)}
            >
              {chat.title}
            </Button>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              <span className="flex items-center">
                <ClockIcon className="mr-1 h-3 w-3" />
                {formatDate(chat.timestamp)}
              </span>
              <span className="flex items-center">
                <HashIcon className="mr-1 h-3 w-3" />
                {chat.id.slice(0, 8)}
              </span>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="mt-auto pt-2 border-t border-gray-200">
        <Button 
          onClick={() => setModel('gpt-3.5-turbo')} 
          variant={model === 'gpt-3.5-turbo' ? 'secondary' : 'ghost'}
          className="w-full mb-1 text-sm justify-start text-gray-700"
        >
          GPT-3.5-Turbo
        </Button>
        <Button 
          onClick={() => setModel('gpt-3.5-turbo-16k')} 
          variant={model === 'gpt-3.5-turbo-16k' ? 'secondary' : 'ghost'}
          className="w-full text-sm justify-start text-gray-700"
        >
          GPT-3.5-Turbo-16k
        </Button>
      </div>
    </aside>
  )
}