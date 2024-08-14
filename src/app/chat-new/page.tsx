"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, Send, Edit, Trash2, PlusIcon, MoreVertical, ListIcon, ListPlus, CalendarIcon, PencilIcon, TrashIcon, UserIcon, CheckIcon, CopyIcon, BotMessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import PromptDialog from './components/PromptDialog';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/components/ui/use-toast';
import { DeleteConfirmationPopup } from './components/DeleteConfirmationPopup';
import { UpdatePromptPopup } from './components/UpdatePromptPopup';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AvailablePromptsPopup } from './components/AvailablePromptsPopup';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from 'ai/react';
import { v4 as uuidv4 } from 'uuid';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WandIcon } from "lucide-react";
import Magic from '@/components/tailwind/magic';
import { usePopper } from 'react-popper'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from '@/components/ui/toaster';
import { isSameDay } from 'date-fns';
import { checkRateLimit, logRateLimitedRequest } from '@/lib/rateLimit';


const DEFAULT_PROMPT: any = {
  id: 'default',
  title: 'Chat AI',
  prompt: 'You are a helpful AI assistant. Answer the user\'s questions to the best of your ability.',
  temperature: 0.2,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxTokens: 150,
};

export default function ChatNewPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isLoadingListPrompt, setIsLoadingListPrompt] = useState(false);
  const [listPrompts, setListPrompts] = useState([]);
  const [error, setError] = useState('');
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [deletePromptTitle, setDeletePromptTitle] = useState<string>('');
  const [updatePromptId, setUpdatePromptId] = useState<string | null>(null);
  const [updatePrompt, setUpdatePrompt] = useState<any | null>(null);
  const [isAvailablePromptsOpen, setIsAvailablePromptsOpen] = useState(false);
  const [chatHistoryNEW, setChatHistoryNEW] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; messages: any[]; timestamp: number; prompt: string }[]>([])
  const [params, setParams] = useState<any>(
    {
      prompt: DEFAULT_PROMPT.prompt,
      model: 'gpt-3.5-turbo',
      temperature: DEFAULT_PROMPT.temperature,
      topP: DEFAULT_PROMPT.topP,
      presencePenalty: DEFAULT_PROMPT.presencePenalty,
      frequencyPenalty: DEFAULT_PROMPT.frequencyPenalty,
      maxTokens: DEFAULT_PROMPT.maxTokens,
      titlePrompt: 'New Chat',
    }
  )
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [deleteChatTitle, setDeleteChatTitle] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const [popperPosition, setPopperPosition] = useState({ top: 0, left: 0 });
  const [rateLimitedUser, setRateLimitedUser] = useState<any>([]);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });




  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchRateLimitedUser = async () => {
    const response = await fetch(`/api/rate-limit-user?username=${user?.username}`);
    const data = await response.json();
    setRateLimitedUser(data);
    console.log('Rate limited user:', data);
  }

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setPopperPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setIsPopperOpen(true);
    } else {
      setIsPopperOpen(false);
    }
  };


  const fetchChatHistory = async () => {
    if (!user) return;
    setIsLoadingChatHistory(true);
    try {
      const response = await fetch(`/api/chat-history-new?username=${user?.username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      const data = await response.json();
      setChatHistoryNEW(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setIsLoadingChatHistory(false);
    }
  };


  // message
  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    // id: currentChatId || undefined,
    initialMessages: [],
    body: {
      model: params.model,
      temperature: params.temperature,
      prompt: params.prompt,
      topP: params.topP,
      presencePenalty: params.presencePenalty,
      frequencyPenalty: params.frequencyPenalty,
      maxTokens: params.maxTokens,
      userId: user?.id,
      username: user?.username,
    },
    onFinish: (message) => {
      console.log('message', message)
      setChatHistory(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, message], title: chat.messages[0].content.slice(0, 30) }
          : chat
      ))

    },
    onError: (error) => {
      console.error('Error from chat API:', error);
      handleApiError(error);
    },
  });

  const handleApiError = async (error: Error) => {
    await fetchRateLimitedUser();
    console.log('Error from chat API:', rateLimitedUser);
    
    if (JSON.parse(error.message).message === 'You have reached your request limit for the day.') {
      const today = new Date();
      const existingRateLimit = rateLimitedUser.find((entry: any) => 
        isSameDay(new Date(entry.timestamp), today)
      );

      if (!existingRateLimit) {
        try {
          const response = await fetch('/api/rate-limit-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              username: user?.username,
              feature: 'chat-bot-ai',
            }),
          });
          if (!response.ok) throw new Error('Failed to save rate limit');
          const savedRateLimit = await response.json();
          setRateLimitedUser((prev : any) => [...prev, savedRateLimit]);
        } catch (error) {
          console.error('Error saving rate limit:', error);
        }
      }

      toast({
        title: "Rate Limit Exceeded",
        description: "You have reached your request limit for the day.",
        duration: 5000,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An error occurred while sending your message.",
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (messages.length != 0) {
      // console.log('Updated messages:', messages, messages.map(m => ({
      //   role: m.role,
      //   content: m.content
      // })));
      saveChat(messages)
    }
    // saveChat(messages)
  }, [chatHistory]);




  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // try {
    //   const { success, limit, reset, remaining } = await checkRateLimit(user?.id || '', 'chat');

    //   if (!success) {
    //     await logRateLimitedRequest(user?.id || '', user?.username || '', 'chat');
    //     toast({
    //       title: "Rate Limit Exceeded",
    //       description: "You have reached your request limit for chat. Please try again later.",
    //       duration: 5000,
    //       variant: "destructive",
    //     });
    //     return;
    //   }

    //   await originalHandleSubmit(e);
    // } catch (error: any) {
    //   console.error('Error submitting chat:', error);
    //   handleApiError(error);
    // }
      await originalHandleSubmit(e);
    setSelectedText('');
    setIsPopperOpen(false);
  };

  const saveChat = async (newMessage: any) => {
    if (!currentChatId) {

      try {
        const response = await fetch('/api/chat-history-new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...params,
            messages: newMessage,
            titleChat: newMessage[0].content.substring(0, 30),
            username: user?.username,
            userId: user?.id,
          }),
        });
        if (!response.ok) throw new Error('Failed to save chat');
        const savedChat = await response.json();
        // setChatHistoryNEW(prev => [savedChat, ...prev]);
        setCurrentChatId(savedChat.id);
        fetchChatHistory();
      } catch (error) {
        console.error('Error saving chat:', error);
      }
    } else {
      // console.log('updated Messages 333', newMessage)
      try {
        const response = await fetch(`/api/chat-history-new/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessage }),
        });
        if (!response.ok) throw new Error('Failed to update chat');
        const updatedChatFromServer = await response.json();
        // setCurrentChatId(updatedChatFromServer.id);
      } catch (error) {
        console.error('Error updating chat:', error);
      }
      // }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);


  // get list of prompts
  const fetchPrompts = async () => {
    if (!user) return;

    setIsLoadingListPrompt(true);
    try {
      const response = await fetch(`/api/list-prompt?username=${user.username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      const data = await response.json();
      setListPrompts(data);
    } catch (err) {
      setError('Failed to load prompts');
      console.error(err);
    } finally {
      setIsLoadingListPrompt(false);
    }
  };


  // delete prompt
  const handleDelete = async (id: string) => {
    setIsLoadingListPrompt(true);

    try {
      const response = await fetch(`/api/new-prompt/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });
      fetchPrompts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        duration: 3000,
        variant: "destructive",
        className: "bg-red-100 border-red-400 text-red-700",
      });
    } finally {
      setIsLoadingListPrompt(false);
      closeDeleteConfirmation();
    }
  };



  const handleOpenPromptDialog = () => {
    setIsPromptDialogOpen(true);
  };

  const handleClosePromptDialog = () => {
    setIsPromptDialogOpen(false);
  };

  const handlePromptSaved = () => {
    fetchPrompts();
  };


  const openDeleteConfirmation = (id: string, title: string) => {
    setDeletePromptId(id);
    setDeletePromptTitle(title);
  };

  const closeDeleteConfirmation = () => {
    setDeletePromptId(null);
    setDeletePromptTitle('');
  };

  const handleOpenAvailablePrompts = () => {
    setIsAvailablePromptsOpen(true);
  };

  const handleCloseAvailablePrompts = () => {
    setIsAvailablePromptsOpen(false);
  };

  const handleSelectPrompt = (prompt: any) => {
    setMessages([]);
    setCurrentChatId(null);
    setParams({
      prompt: prompt.prompt,
      model: prompt.model || 'gpt-3.5-turbo',
      temperature: prompt.temperature || 0.5,
      topP: prompt.topP || 1,
      presencePenalty: prompt.presencePenalty || 0,
      frequencyPenalty: prompt.frequencyPenalty || 0,
      maxTokens: prompt.maxTokens || 150,
      titlePrompt: prompt.title,
    });
    handleCloseAvailablePrompts();
  };

  const formatMessage = (content: string | undefined) => {
    if (!content) return null;

    const codeBlockRegex = /```([\s\S]*?)```/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const numberedListRegex = /^\d+\.\s/gm;
    const colonRegex = /:\s*/g;

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
        <div key={index} className="mb-2 text-gray-800">
          {lines.map((line, lineIndex) => {
            if (numberedListRegex.test(line)) {
              // This is a numbered list item
              const [numberAndTitle, ...descriptionParts] = line.split(':');
              const [number, ...titleParts] = numberAndTitle.split(/\.\s/);
              const title = titleParts.join('. ').trim().replace(/\*\*/g, '');
              const description = descriptionParts.join(':').trim();

              return (
                <div key={lineIndex} className="mb-3">
                  <div className="flex items-start">
                    <span className="font-bold mr-2">{number}.</span>
                    <span className="font-bold">{title}</span>
                  </div>
                  {description && (
                    <div className="ml-8 mt-1">
                      {description.split(colonRegex).map((segment, segmentIndex) => (
                        <React.Fragment key={segmentIndex}>
                          {segmentIndex > 0 && <br />}
                          {segment.split(boldRegex).map((text, textIndex) =>
                            textIndex % 2 === 0 ? text : <strong key={textIndex}>{text}</strong>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // This is a regular paragraph
              return (
                <p key={lineIndex}>
                  {line.split(colonRegex).map((segment, segmentIndex) => (
                    <React.Fragment key={segmentIndex}>
                      {segmentIndex > 0 && <br />}
                      {segment.split(boldRegex).map((text, textIndex) =>
                        textIndex % 2 === 0 ? text : <strong key={textIndex}>{text}</strong>
                      )}
                      {segmentIndex < line.split(colonRegex).length - 1 && ':'}
                    </React.Fragment>
                  ))}
                </p>
              );
            }
          })}
        </div>
      );
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


  const loadChat = async (id: string) => {
    const response = await fetch(`/api/chat-history-new/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to update chat');
    const updatedChatFromServer = await response.json();
    setMessages(updatedChatFromServer[0].messages);
    setParams({
      model: updatedChatFromServer[0].model,
      temperature: updatedChatFromServer[0].temperature,
      topP: updatedChatFromServer[0].topP,
      presencePenalty: updatedChatFromServer[0].presencePenalty,
      frequencyPenalty: updatedChatFromServer[0].frequencyPenalty,
      maxTokens: updatedChatFromServer[0].maxTokens,
      titlePrompt: updatedChatFromServer[0].titlePrompt,
      prompt: updatedChatFromServer[0].prompt,
    });
    setCurrentChatId(id);
  }
  const openDeleteChatConfirmation = (id: string, title: string) => {
    setDeleteChatId(id);
    setDeleteChatTitle(title);
  };

  const closeDeleteChatConfirmation = () => {
    setDeleteChatId(null);
    setDeleteChatTitle('');
  };

  const deleteChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chat-history-new/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete chat');
      toast({
        title: "Success",
        description: "Chat deleted successfully",
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });
      fetchChatHistory();
      if (currentChatId === id) {
        setCurrentChatId(null);
        setMessages([]);
      }
      closeDeleteChatConfirmation();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        duration: 3000,
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <Toaster />
      <div className="flex p-1 space-x-4 h-full ml-6">
        {/* Left Sidebar */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 w-full">
              <Button
                onClick={() => {
                  setCurrentChatId(null);
                  setMessages([]);

                }}
                className="flex-grow flex items-center justify-center bg-[#6c47ff]"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Chat
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 p-0">
                    <ListPlus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={handleOpenPromptDialog}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <span>Add New Prompt</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenAvailablePrompts}>
                    <ListIcon className="mr-2 h-4 w-4" />
                    <span>List Prompts</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="h-[calc(100vh-180px)] max-h-[69vh]">
              {isLoadingChatHistory ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
              ) : (
                chatHistoryNEW.map((chat) => (
                  <TooltipProvider key={chat.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded flex justify-between items-center"
                        >
                          <div onClick={() => loadChat(chat.id)}>
                            <h3 className="font-semibold truncate">{chat.titleChat}</h3>
                            <p className="text-xs text-gray-500">{new Date(chat.createdAt).toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteChatConfirmation(chat.id, chat.titleChat);
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div>
                          <p className="font-semibold">{chat.titlePrompt}</p>
                          <p className="text-sm text-gray-600 mt-1">{chat.prompt}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main content */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b p-3 pl-6">
            <CardTitle className='text-lg font-semibold'>{params.titlePrompt}</CardTitle>
            <CardDescription className='text-xs text-gray-600'>
              {params.prompt.length > 50
                ? params.prompt.slice(0, 50) + '...'
                : params.prompt}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-4">
            <ScrollArea className="flex-grow h-full">
              <div className="max-w-2xl mx-auto py-4 px-4 h-[1vh]">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat AI</h2>
                    <p className="text-gray-600">Start a conversation with the AI assistant</p>
                  </div>
                ) : (
                  messages.map((m, index) => (
                    <div key={index} className={`mb-6 ${m.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`flex items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-gray-200 ml-4' : 'bg-black text-white mr-4'
                          }`}>
                          {m.role === 'user' ? <UserIcon className="w-5 h-5 text-gray-600" /> : <BotMessageSquare className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <div className="text-gray-800 break-words" onMouseUp={handleTextSelection} >{formatMessage(m.content)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {/* Message input */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Send a message"
                  className="flex-1"
                  value={input}
                  onChange={handleInputChange}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <Card className=" h-full flex flex-col w-[22%]">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className='text-lg font-semibold'>List of Prompts</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-4">
            <ScrollArea className="h-full">
              {isLoadingListPrompt ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
              ) : (
                <div className="space-y-4">
                  {listPrompts.map((prompt: any) => (
                    <Card
                      onClick={() => {
                        handleSelectPrompt(prompt);
                      }}
                      key={prompt.id}
                      className={`cursor-pointer w-[18.5vw] transition-colors hover:bg-gray-100 `}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div onClick={() => { }} className="w-[9vw]">
                            <h3 className="font-semibold text-sm mb-2">{prompt.title}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2 overflow-hidden text-ellipsis">{prompt.prompt}</p>
                            <div className="flex items-center text-xs text-gray-500 space-x-2">
                              <div className="flex items-center">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {new Date(prompt.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-purple-100 hover:bg-purple-200 text-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdatePromptId(prompt.id);
                                setUpdatePrompt(prompt);
                              }}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-red-100 hover:bg-red-200 text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteConfirmation(prompt.id, prompt.title);
                              }}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>

        </Card>
        {/* PromptDialog */}
        <PromptDialog
          isOpen={isPromptDialogOpen}
          onClose={handleClosePromptDialog}
          onPromptSaved={handlePromptSaved}
        />

        {/* DeleteConfirmationPopup */}
        <DeleteConfirmationPopup
          isOpen={!!deletePromptId}
          onClose={closeDeleteConfirmation}
          onConfirm={async () => {
            if (deletePromptId) {
              await handleDelete(deletePromptId);
            }
          }}
          promptTitle={deletePromptTitle}
        />
        {/* UpdatePromptPopup */}
        <UpdatePromptPopup
          isOpen={!!updatePromptId}
          onClose={() => {
            setUpdatePromptId(null);
            setUpdatePrompt(null);
          }}
          prompt={updatePrompt}
          onUpdate={fetchPrompts}
        />

        {/* AvailablePromptsPopup */}
        <AvailablePromptsPopup
          defaultPrompt={DEFAULT_PROMPT}
          onSetDefaultPrompt={() => { }}
          isOpen={isAvailablePromptsOpen}
          onClose={handleCloseAvailablePrompts}
          onSelectPrompt={handleSelectPrompt}
        />

        {/* delete history */}
        <DeleteConfirmationPopup
          isOpen={!!deleteChatId}
          onClose={closeDeleteChatConfirmation}
          onConfirm={async () => {
            if (deleteChatId) {
              await deleteChat(deleteChatId);
            }
          }}
          promptTitle={deleteChatTitle}
        />

        <Popover open={isPopperOpen} onOpenChange={setIsPopperOpen}>
          <PopoverTrigger asChild>
            <div style={{ position: 'absolute', top: popperPosition.top, left: popperPosition.left }}>
              {/* This div is invisible and just used for positioning */}
            </div>
          </PopoverTrigger>
          <PopoverContent style={{ width: '100%', height: '100%' }}>
            <Button
              className="rounded-none text-purple-500"
              variant="ghost"
              size="sm"
              onClick={() => {
                handleInputChange({ target: { value: `Regarding the following text: "${selectedText}", can you explain or elaborate on it?` } } as React.ChangeEvent<HTMLInputElement>);
                setIsPopperOpen(false);
              }}
            >
              <Magic className="h-5 w-5" />
              Ask AI
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </>

  );
}