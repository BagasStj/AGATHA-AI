import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface NodeData extends Record<string, unknown> {
    label: string;
    model?: string;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxTokens?: number;
}

interface NodeInfoCardVapiProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

const NodeInfoCardVapi: React.FC<NodeInfoCardVapiProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [topP, setTopP] = useState(1.0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [defaultCall, setDefaultCall] = useState<any>({
        firstMessage: "Hai beb, can I help you today?",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            messages: [
                {
                    role: "assistant",
                    content: "You are an assistant.",//system prompt
                },
            ],
            maxTokens: 5,
        },
        voice: {
            provider: "11labs",
            voiceId: "burt",
        },
    });

    useEffect(() => {
        if (node) {
            setTitle(node.data.label);
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdateNode(node.id, {
            label: title,
            setVapi :{...defaultCall},
        });
        onClose();
    };

    return (
        <div className="absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-xl font-bold text-gray-800">Set Phone Vapi</h3>
            </div>
            <div className="px-6 pb-4 space-y-2 overflow-y-auto flex-grow h-[49vh]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                <div className="mb-1">
                    <label htmlFor="firstMessage" className="block text-sm font-medium text-gray-700 mb-1">
                        First Message
                    </label>
                    <input
                        value={defaultCall.firstMessage}
                        onChange={(e) => setDefaultCall({ ...defaultCall, firstMessage: e.target.value })}
                        type="text"
                        id="firstMessage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter the first message"
                    />
                </div>

                <div className="mb-1">
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                        System Prompt
                    </label>
                    <textarea
                        value={defaultCall.model.messages[0].content}
                        onChange={(e) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], content: e.target.value }] } })}
                        id="systemPrompt"
                        rows={4}
                        className="w-full px-3  py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter the system prompt"
                    ></textarea>
                </div>
              
                <div className="mb-4">
                    <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-1">
                        Voice
                    </label>
                    <Select value={defaultCall.voice.voiceId} onValueChange={(value) => setDefaultCall({ ...defaultCall, voice: { ...defaultCall.voice, voiceId: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {['burt', 'marissa', 'andrea', 'sarah', 'phillip', 'steve', 'joseph', 'myra', 'paula', 'ryan', 'drew', 'paul', 'mrb', 'matilda', 'mark'].map((voice) => (
                                <SelectItem key={voice} value={voice}>
                                    {voice.charAt(0).toUpperCase() + voice.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <Select value={defaultCall.model.messages[0].role} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, messages: [{ ...defaultCall.model.messages[0], role: value }] } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {['assistant', 'function', 'user', 'system', 'tool'].map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-4">
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                    </label>
                    <Select value={defaultCall.model.provider} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, provider: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="mb-4">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                    </label>
                    <Select value={defaultCall.model.model} onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, model: value } })} >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                        Temperature
                    </label>
                    <div className="flex items-center">
                        <Slider
                            id="temperature"
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full mr-4"
                            defaultValue={[defaultCall.model.temperature]}
                            onValueChange={(value) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, temperature: value[0] } })}
                            
                        />
                           <span className="text-sm font-medium text-gray-700">
                        {defaultCall.model.temperature.toFixed(1)}
                    </span>
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Tokens
                    </label>
                    <Input
                        value={defaultCall.model.maxTokens}
                        onChange={(e) => setDefaultCall({ ...defaultCall, model: { ...defaultCall.model, maxTokens: e.target.value } })}
                        type="number"
                        id="maxTokens"
                        placeholder="Enter max tokens"
                        className="w-full"
                        
                    />
                    
                </div>
            </div>
            <div className="p-6 pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default NodeInfoCardVapi;