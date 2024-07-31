import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface ChatDialogProps {
  onClose: () => void;
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
}

const ChatDialog: React.FC<ChatDialogProps> = ({ onClose, selectedNode, nodes, edges }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchChatResponse = async (input: string) => {
    try {
      const response = await fetch('/api/chat-flowise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          nodes: nodes,
          edges: edges,
          selectedNodeId: selectedNode?.id
        }),
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

  const fetchChatResponseChat = async (input: string) => {
    try {
      const response = await fetch('/api/chat-general-flowise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          nodes: nodes,
          edges: edges,
          selectedNodeId: selectedNode?.id
        }),
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

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      if (nodes.find(node => node.data.nodeType === 'LLM Antonim')) {
        const response = await fetchChatResponse(input);
        if (response) {
          const assistantMessage = {
            role: 'ai' as const,
            content: response.content,
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } else if (nodes.find(node => node.data.nodeType === 'LLM Chat')) {
        const response = await fetchChatResponseChat(input);
        if (response) {
          const assistantMessage = {
            role: 'ai' as const,
            content: response.content,
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } else {
        // Handle other node types or default behavior
        setMessages(prevMessages => [...prevMessages, { role: 'ai', content: "This node type doesn't support chat functionality." }]);
      }

      setInput('');
    }
  };

  return (
    <div className="absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 h-[70vh] flex flex-col max-h-[calc(100vh-6rem)]">
      <div className="p-6 pb-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold mb-6 text-gray-800">Chat AI Flowise</h3>
      </div>

      <ScrollArea className="px-6 pb-4 space-y-4 overflow-y-auto flex-grow">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-6 pt-4 border-t border-gray-200">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mr-2"
          />
          <Button type="submit" size="icon" className="bg-gray-700 hover:bg-gray-800 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatDialog;