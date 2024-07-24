import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusIcon, ClockIcon, HashIcon, XIcon } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from "@/components/ui/slider"
import { toast } from '@/components/ui/use-toast';


type SidebarProps = {
    chatHistory: { id: string; title: string; messages: any[]; timestamp: number | string }[]
    startNewChat: () => void
    loadChat: (chatId: string) => void
    model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k'
    setModel: (model: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k') => void
    isOpen: boolean
    onClose: () => void
    prompt: string
    setPrompt: (prompt: string) => void
    temperature: number
    setTemperature: (temperature: number) => void
    topP: number
    setTopP: (topP: number) => void
    presencePenalty: number
    setPresencePenalty: (presencePenalty: number) => void
    frequencyPenalty: number
    setFrequencyPenalty: (frequencyPenalty: number) => void
    maxTokens: number
    setMaxTokens: (maxTokens: number) => void
}
export default function Sidebar({ 
    chatHistory, 
    startNewChat, 
    loadChat, 
    model, 
    setModel, 
    isOpen, 
    onClose, 
    prompt,
    setPrompt,
    temperature,
    setTemperature,
    topP,
    setTopP,
    presencePenalty,
    setPresencePenalty,
    frequencyPenalty,
    setFrequencyPenalty,
    maxTokens,
    setMaxTokens
}: SidebarProps) {
    const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
    const [tempPrompt, setTempPrompt] = useState(prompt);
    const [tempTemperature, setTempTemperature] = useState(temperature ?? 0.7);
    const [tempTopP, setTempTopP] = useState(topP ?? 1);
    const [tempPresencePenalty, setTempPresencePenalty] = useState(presencePenalty ?? 0);
    const [tempFrequencyPenalty, setTempFrequencyPenalty] = useState(frequencyPenalty ?? 0);
    const [tempMaxTokens, setTempMaxTokens] = useState(maxTokens ?? 2048);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setTempPrompt(prompt);
        setTempTemperature(temperature ?? 0);
        setTempTopP(topP ?? 0.9);
        setTempPresencePenalty(presencePenalty ?? 0.6);
        setTempFrequencyPenalty(frequencyPenalty ?? 0.6);
        setTempMaxTokens(maxTokens ?? 3048);
    }, [prompt, temperature, topP, presencePenalty, frequencyPenalty, maxTokens]);

    const handlePromptSubmit = async () => {
        setIsLoading(true);
        setPrompt(tempPrompt);
        setTemperature(tempTemperature);
        setTopP(tempTopP);
        setPresencePenalty(tempPresencePenalty);
        setFrequencyPenalty(tempFrequencyPenalty);
        setMaxTokens(tempMaxTokens);
        setIsPromptDialogOpen(false);
        try {
            const response = await fetch('/api/chat/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: tempPrompt,
                    temperature: tempTemperature,
                    topP: tempTopP,
                    presencePenalty: tempPresencePenalty,
                    frequencyPenalty: tempFrequencyPenalty,
                    maxTokens: tempMaxTokens,
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to save chat settings');
            }
    
            // Handle successful response
            const result = await response.json();
            console.log('Chat settings saved:', result);
            toast({
                title: "Settings saved",
                description: "Your chat settings have been successfully saved.",
            });
        } catch (error) {
            console.error('Error saving chat settings:', error);
            // Optionally, show an error message to the user
            console.error('Error saving chat settings:', error);
            toast({
                title: "Error",
                description: "Failed to save chat settings. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp: number | string) => {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    }

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-800 p-4 flex flex-col border border-gray-200 rounded-lg mr-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
            <div className="flex justify-between items-center mb-4">
                <Button onClick={startNewChat} className="bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                    <PlusIcon className="mr-2 h-4 w-4" /> New chat
                </Button>
                <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Custom Prompt and Settings</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="prompt">Prompt</Label>
                                <Textarea
                                    id="prompt"
                                    value={tempPrompt}
                                    onChange={(e) => setTempPrompt(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="temperature">Temperature: {tempTemperature.toFixed(2)}</Label>
                                <Slider
                                    id="temperature"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={[tempTemperature]}
                                    onValueChange={(value) => setTempTemperature(value[0])}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="topP">Top P: {tempTopP.toFixed(2)}</Label>
                                <Slider
                                    id="topP"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={[tempTopP]}
                                    onValueChange={(value) => setTempTopP(value[0])}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="presencePenalty">Presence Penalty: {tempPresencePenalty.toFixed(2)}</Label>
                                <Slider
                                    id="presencePenalty"
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    value={[tempPresencePenalty]}
                                    onValueChange={(value) => setTempPresencePenalty(value[0])}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="frequencyPenalty">Frequency Penalty: {tempFrequencyPenalty.toFixed(2)}</Label>
                                <Slider
                                    id="frequencyPenalty"
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    value={[tempFrequencyPenalty]}
                                    onValueChange={(value) => setTempFrequencyPenalty(value[0])}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxTokens">Max Tokens: {tempMaxTokens}</Label>
                                <Slider
                                    id="maxTokens"
                                    min={1}
                                    max={4096}
                                    step={1}
                                    value={[tempMaxTokens]}
                                    onValueChange={(value) => setTempMaxTokens(value[0])}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button onClick={handlePromptSubmit} disabled={isLoading}>
    {isLoading ? 'Saving...' : 'Set Prompt and Settings'}
</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button onClick={onClose} variant="ghost" className="md:hidden">
                    <XIcon className="h-5 w-5" />
                </Button>
            </div>
            <div className="mb-4 text-sm">
                <strong>Current Prompt:</strong> {prompt || 'Default'}
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