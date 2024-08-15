import React, { useState, useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ScrollText, Upload } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/components/ui/use-toast";

interface NodeData extends Record<string, unknown> {
    label: string;
    pdfFile?: File;
    fileName?: string;

}

interface NodeInfoCardKnowledgeRetrievalProps {
    node: Node<NodeData> | null;
    onClose: () => void;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

const NodeInfoCardKnowledgeRetrieval: React.FC<NodeInfoCardKnowledgeRetrievalProps> = ({ node, onClose, onUpdateNode }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const { user } = useUser();

    const { toast } = useToast();

    useEffect(() => {
        if (node) {
            setTitle(node.data.label || '');
            setFileName(node.data.fileName);
            if (node.data.file instanceof File) {
                setFile(node.data.file);
            }
            setDescription(node.data.description as string || node.data.nodeType as string);

        }
    }, [node]);


    if (!node) return null;
    let formData = new FormData();


    const fetchUpserrt = async () => { //upsertfile
        setIsLoading(true);
        if (file && user) {
            formData.append("files", file);
            formData.append("legacyBuild", 'true')
            formData.append("pineconeIndex", `flowise-ai-${user.username}`)
        }
        try {
            const response = await fetch('https://flowiseai-railway-production-9629.up.railway.app/api/v1/vector/upsert/52ff5341-453e-48b5-a243-fe203b7c65fa', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Error: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            setIsLoading(false);
            onClose();
            return data;
        } catch (error) {
            console.error('Error in fetchUpserrt:', error);
            // You can add a toast notification here to inform the user about the error
            return null;
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        if (!fileName || !file || !user) {
            alert('Please upload a file before saving.');
            return;
        }

        try {
            const response = await fetch('/api/chat-ratelimit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id ,type:'flow' }),
            });
            const { success } = await response.json();

            if (!success) {
                toast({
                    title: "Rate Limit Exceeded",
                    description: "You have reached your request limit for the day.",
                    duration: 5000,
                    variant: "destructive",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64File = e.target?.result as string;
                const response = await fetch('/api/save-file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName,
                        userId: user.id,
                        file: base64File,
                        userName: user.username
                    }),
                });
                if (!response.ok) {
                    throw new Error('Failed to save file data');
                }
                await fetchUpserrt();
                onUpdateNode(node.id, {
                    label: title,
                    pdfFile: file,
                    fileName: fileName,
                    description: description,
                });

            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error in handleSave:', error);
            toast({
                title: "Error",
                description: "An error occurred while saving.",
                duration: 5000,
                variant: "destructive",
            });
        } finally {
            
        }
    };
    const handleFileUpload = (uploadedFile: File) => {
        const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(uploadedFile.type)) {
            setFile(uploadedFile);
            setFileName(uploadedFile.name);
        } else {
            alert('Please upload a PDF, CSV, or DOCX file');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileUpload(droppedFile);
    };

    return (
        <div className="absolute right-4 top-20 w-96 bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)]">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-[#ff47bf] rounded-full p-1 mr-2">
                        <ScrollText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mr-2">Knowledge Document</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 pb-4 space-y-4 overflow-y-auto flex-grow h-[49vh]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                </div>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer h-[30vh] flex flex-wrap justify-center items-center ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                >
                    <input
                        type="file"
                        accept=".pdf,.csv,.docx"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                        Drag and drop your file here, or click to select
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, CSV , DOCX
                    </p>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                        variant="outline"
                    >
                        Upload Document
                    </Button>
                </div>
                {fileName && <p className="mt-2 text-sm text-gray-600 font-bold">Selected file: {fileName}</p>}            </div>
            <div className="p-6 pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </div>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default NodeInfoCardKnowledgeRetrieval;