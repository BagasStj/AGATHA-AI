import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NodeData extends Record<string, unknown> {
    label: string;
    model?: string;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    maxTokens?: number;
}

interface NodeInfoCardProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

const NodeInfoCard: React.FC<NodeInfoCardProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [model, setModel] = useState('gpt-3.5-turbo');
    const [temperature, setTemperature] = useState(0.7);
    const [topP, setTopP] = useState(1.0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [maxTokens, setMaxTokens] = useState(2048);

    useEffect(() => {
        if (node) {
            setTitle(node.data.label);
            setModel(node.data.model ?? 'gpt-3.5-turbo');
            setTemperature(node.data.temperature ?? 0.7);
            setTopP(node.data.topP ?? 1.0);
            setPresencePenalty(node.data.presencePenalty ?? 0);
            setFrequencyPenalty(node.data.frequencyPenalty ?? 0);
            setMaxTokens(node.data.maxTokens ?? 2048);
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdateNode(node.id, {
            label: title,
            model,
            temperature,
            topP,
            presencePenalty,
            frequencyPenalty,
            maxTokens,
        });
        onClose();
    };

    return (
        <div className="absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-6 pb-4">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-xl font-bold mb-6 text-gray-800">Custom Node and Settings</h3>
            </div>
            <div className="px-6 pb-4 space-y-6 overflow-y-auto flex-grow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16k</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
            </div>
            <div className="p-6 pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                >
                    Set Prompt and Settings
                </button>
            </div>
        </div>
    );
};

export default NodeInfoCard;