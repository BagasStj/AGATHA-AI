import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Fullscreen, Minimize, UserIcon, Eraser, BotMessageSquare, CheckIcon, CopyIcon } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogContentChat,
} from "@/components/ui/dialog";
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatDialogProps {
  onClose: () => void;
  selectedNode: Node | null;
  nodes: Node[];
  edges: Edge[];
  isNodeInfoCardOpen: boolean;
}

const LoadingIndicator = () => (
  <div className="flex justify-center items-center space-x-1 mb-4">
    <div className="w-2 h-2 bg-[#6c47ff] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-[#6c47ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-[#6c47ff] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const MessageInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [input, setInput] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 border-t">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow"
      />
      <Button type="submit" size="icon" className="bg-[#6c47ff]  hover:bg-[#947fe4]  text-white">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

const ChatDialog: React.FC<ChatDialogProps> = ({ onClose, selectedNode, nodes, edges, isNodeInfoCardOpen }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { "role": "ai", "content": "Hi there! How can I help?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();



  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // LLM By Knowledge https://flowiseai-railway-production-9629.up.railway.app/canvas/aeccfeee-a1c8-479e-9497-d31b690558d5
  const fetchChatResponsePdf = async (input: string) => {
    try {
      if (!user) return;
      const pdfNode = nodes.find(node => node.data.nodeType === 'LLM By Knowledge');
      const knowledgeNode = nodes.find(node => node.data.nodeType === 'Knowledge Document' || node.data.nodeType === 'Knowledge URL');

      if (!pdfNode || !knowledgeNode) {
        throw new Error('Required nodes not found');
      }

      let formData = new FormData();


      if (knowledgeNode.data.nodeType === 'Knowledge Document') {
        if (!knowledgeNode.data.pdfFile || !(knowledgeNode.data.pdfFile instanceof Blob)) {
          throw new Error('Invalid PDF file');
        }
        let model: any = pdfNode.data.model || 'gpt-3.5-turbo';
        console.log('Knowledge Document', pdfNode);
        formData.append("files", knowledgeNode.data.pdfFile);
        formData.append("tableName", "documents");
        formData.append("queryName", "match_documents");
        formData.append("pineconeIndex", `flowise-ai-${user.username}`);
        // formData.append("modelName", model);
        formData.append("question", input);

        const response = await fetch(
          "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/52ff5341-453e-48b5-a243-fe203b7c65fa",
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
      } else if (knowledgeNode.data.nodeType === 'Knowledge URL') {

        const url = knowledgeNode.data.url as string;

        const response = await fetch(
          "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/26831c4f-6d3d-4980-aa72-f613c2b853da",
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: input,
              overrideConfig: {
                repoLink: url,
                pineconeIndex: `flowise-ai-${user.username}`
              }
            })
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('API Response:', data);
        return data;
      }


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

  // GENERAL CHAT WITH PROMPThttps://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/2f25175a-5c6f-474a-918a-84ae054a92d8
  const fetchChatResponseChat = async (input: string, prompt: string) => {
    try {
      const response = await fetch('https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/2f25175a-5c6f-474a-918a-84ae054a92d8', {
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

  const handleSend = useCallback(async (input: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/chat-ratelimit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, type: 'flow' }),
      });
      const { success } = await response.json();

      if (!success) {
        toast({
          title: "Rate limit exceeded",
          description: "You have reached your chat limit for today.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      const llmChatNodes = nodes.filter(node => node.data.nodeType === 'LLM With Custom Prompt');

      if (llmChatNodes.length === 2) {
        // Chain two LLM With Custom Prompt nodes
        let firstPrompt: any = llmChatNodes[0].data.prompt || '';
        let secondPrompt: any = llmChatNodes[1].data.prompt || '';

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
        // console.log('MESSAGES', messages);

      } else if (llmChatNodes.length === 1) {
        // Single LLM With Custom Prompt node
        const chatNode = llmChatNodes[0];
        const prompt: any = chatNode.data.prompt || '';
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
        console.log('MESSAGES', messages);

      } else if (nodes.find(node => node.data.nodeType === 'LLM By Knowledge')) {
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
    } catch (error) {
      console.error('Error in handleSend:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, selectedNode, user, toast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const formatMessage = (content: string | undefined) => {
    if (!content) return null;

    const codeBlockRegex = /```([\s\S]*?)```/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const numberedListRegex = /^\d+\.\s/;
    const colonRegex = /:\s*/;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = content.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        const [language, ...codeLines] = part.trim().split('\n');
        const code = codeLines.join('\n');
        return (
          <div key={index} className="relative my-4">
            <div className="bg-gray-800 text-gray-200 rounded-t-md px-4 py-2 text-sm font-mono flex items-center justify-between">
              <span>{language || 'Code'}</span>
              <CopyButton text={code} language={language} />
            </div>
            <SyntaxHighlighter
              language={language.toLowerCase() || 'text'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      // This is regular text with potential formatting
      const lines = part.split('\n');
      return (
        <div key={index} className="mb-2 ">
          {lines.map((line, lineIndex) => {
            const match = line.match(numberedListRegex);
            if (match) {
              // This is a numbered list item
              const [number, rest] = line.split(match[0]);
              const [title, ...descriptionParts] = rest.split(':');
              const description = descriptionParts.join(':').trim();

              return (
                <div key={lineIndex} className="mb-3">
                  <div className="flex items-start">
                    <span className="font-bold mr-2">{match[0]}</span>
                    <span className="font-bold">{formatTextWithLinks(title.trim())}</span>
                  </div>
                  {description && (
                    <div className="ml-8 mt-1">
                      {formatTextWithLinks(description)}
                    </div>
                  )}
                </div>
              );
            } else {
              // This is a regular paragraph
              return (
                <p key={lineIndex}>
                  {formatTextWithLinks(line)}
                </p>
              );
            }
          })}
        </div>
      );
    });
  };

  const formatTextWithLinks = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part.split(/(\*\*.*?\*\*)/).map((segment, segmentIndex) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return <strong key={segmentIndex}>{segment.slice(2, -2)}</strong>;
        }
        return segment;
      });
    });
  };

  const CopyButton = ({ text, language }: { text: string, language: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
      try {
        if (text == '') {
          await navigator.clipboard.writeText(language);
        } else {
          await navigator.clipboard.writeText(text);
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    return (
      <Button
        onClick={handleCopy}
        className="p-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
        aria-label="Copy code"
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <CopyIcon className="h-4 w-4 text-gray-300" />
        )}
      </Button>
    );
  }




  const ChatContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">Chat Assistant</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearChat}>
                  <Eraser className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Chat</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Fullscreen className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
            {!isFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="flex-grow p-4 space-y-4 h-[1vh]">
        {messages.map((m, index) => (
          <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${m.role === 'user' ? 'bg-[#6c47ff] text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3 shadow`}>
              <div className={`flex items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'user' ? (
                  <div className="bg-white rounded-full p-1 ml-2">
                    <UserIcon className="w-4 h-4 text-[#6c47ff]" />
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-full p-1 mr-2">
                    <BotMessageSquare className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`break-words ${m.role === 'user' ? 'text-white' : ''}`}>{formatMessage(m.content)}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {isLoading && <LoadingIndicator />}

      <MessageInput onSend={handleSend} />
    </div>
  );

  return (
    <>
      <div
        className={`fixed ${isNodeInfoCardOpen ? 'right-[calc(420px+1rem)]' : 'right-6'} top-40 w-96 bg-white shadow-2xl rounded-lg border border-gray-200 h-[70vh] flex flex-col transition-all duration-300 ease-in-out ${isFullscreen ? 'hidden' : ''}`}
      >
        <ChatContent />
      </div>
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContentChat className="max-w-4xl w-full z-[9999999] h-[90vh]">
          <ChatContent />
        </DialogContentChat>
      </Dialog>
    </>
  );
};

export default ChatDialog;