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


  // LLM CHAT PDF https://flowiseai-railway-production-9629.up.railway.app/canvas/aeccfeee-a1c8-479e-9497-d31b690558d5
  const fetchChatResponsePdf = async (input: string) => {
    try {
      const pdfNode = nodes.find(node => node.data.nodeType === 'LLM Chat PDF');
      if (!pdfNode || !pdfNode.data.pdfFile) {
        throw new Error('PDF file not found');
      }
      let formData = new FormData();
      if (pdfNode.data.pdfFile instanceof Blob) {
        formData.append("files", pdfNode.data.pdfFile);
      } else {
        console.error('PDF file is not a Blob');
        throw new Error('Invalid PDF file');
      }
      formData.append("chunkSize", pdfNode.data.chunkSize?.toString() ?? '');
      formData.append("chunkOverlap", pdfNode.data.chunkOverlap?.toString() ?? '');
      formData.append("topK", pdfNode.data.topK?.toString() ?? '');
      formData.append("question", input);

      const response = await fetch(
        "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/aeccfeee-a1c8-479e-9497-d31b690558d5",
        {
          method: "POST",
          body: formData
        }
      );

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

  // ANTONIM API https://flowiseai-railway-production-9629.up.railway.app/canvas/04b0b7d2-45b8-4aed-be95-362958315cb2
  const fetchChatResponse = async (input: string) => { //antonim-api
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

  // GENERAL CHAT WITH PROMPT https://flowiseai-railway-production-9629.up.railway.app/canvas/05cd0bdc-93b0-46a7-991b-36c8c543958d
  const fetchChatResponseChat = async (input: string, prompt: string) => {
    try {
      const response = await fetch('https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/05cd0bdc-93b0-46a7-991b-36c8c543958d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          overrideConfig: {
            systemMessagePrompt: prompt,
          }
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
  
      const llmChatNodes = nodes.filter(node => node.data.nodeType === 'LLM Chat');
  
      if (llmChatNodes.length === 2) {
        // Chain two LLM Chat nodes
        let firstPrompt :any= llmChatNodes[0].data.prompt || '';
        let secondPrompt :any= llmChatNodes[1].data.prompt || '';
  
        console.log('First Prompt:', firstPrompt);
        console.log('Second Prompt:', secondPrompt);
  
        const firstResponse = await fetchChatResponseChat(input, firstPrompt);
        if (firstResponse) {
          console.log('First LLM Response:', firstResponse);
          const secondResponse = await fetchChatResponseChat(firstResponse.text, secondPrompt);
          if (secondResponse) {
            console.log('Second LLM Response:', secondResponse);
            const assistantMessage = {
              role: 'ai' as const,
              content: secondResponse.text,
            };
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
          }
        }
      } else if (llmChatNodes.length === 1) {
        // Single LLM Chat node
        const chatNode = llmChatNodes[0];
        const prompt :any= chatNode.data.prompt || '';
        console.log('Prompt:', prompt);
        const response = await fetchChatResponseChat(input, prompt);
        if (response) {
          console.log('LLM Response:', response);
          const assistantMessage = {
            role: 'ai' as const,
            content: response.text,
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } else if (nodes.find(node => node.data.nodeType === 'LLM Chat PDF')) {
        const response = await fetchChatResponsePdf(input);
        if (response) {
          const assistantMessage = {
            role: 'ai' as const,
            content: response.text,
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } else if (nodes.find(node => node.data.nodeType === 'LLM Antonim')) {
        const response = await fetchChatResponse(input);
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