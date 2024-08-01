'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge, Connection, NodeTypes, EdgeTypes, BackgroundVariant, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeInfoCard from './components/NodeInfoCard';
import NodeInfoCardVapi from './components/NodeInfoCardVapi';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ChatDialog from './components/ChatDialog'; // Anda perlu membuat komponen ini
import { FileText, Play, Plus, Save, SaveAll, Trash2 } from 'lucide-react';
import { format } from 'date-fns/format';
import { Card, CardContent } from '@/components/ui/card';
import VapiClient from '@vapi-ai/web';
import NodeInfoCardDoc from './components/NodeInfoCardDoc';

interface NodeData {
  label: string;
  setVapi: any;
  onUpdateLabel: (id: string, label: string) => void;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode as unknown as NodeTypes['custom'],
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};


const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;


const initialNodes: Node[] = [];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  // { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
];


export default function FlowComponentWrapper({ selectedFlowId, onFlowSaved, onFlowDeleted }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void, onFlowDeleted: () => void; }) {
  return (
    <ReactFlowProvider>
      <FlowComponent selectedFlowId={selectedFlowId} onFlowSaved={onFlowSaved} onFlowDeleted={onFlowDeleted} />
    </ReactFlowProvider>
  );
}

function FlowComponent({ selectedFlowId, onFlowSaved, onFlowDeleted }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void, onFlowDeleted: () => void; }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [flowName, setFlowName] = useState<string>("Untitled Flow");
  const [lastEditTime, setLastEditTime] = useState<Date | null>(null);
  const { getNodes, getViewport } = useReactFlow();
  const { toast } = useToast();
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
  const [vapiClient, setVapiClient] = useState<VapiClient | null>(null);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );


  const loadFlow = useCallback(async (flowId: string) => {
    try {
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) {
        throw new Error('Failed to load flow');
      }
      const flow = await response.json();
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setCurrentFlowId(flowId);
      setFlowName(flow.name || "Untitled Flow");
      setLastEditTime(new Date(flow.updatedAt || flow.createdAt));
      toast({
        title: "Success",
        description: `Flow "${flow.name}" loaded successfully`,
        className: "bg-green-100 border-green-400 text-green-700",
      });
    } catch (error) {
      console.error('Error loading flow:', error);
      toast({
        title: "Error",
        description: "Failed to load flow. Please try again.",
        variant: "destructive",
      });
    }
  }, [setNodes, setEdges, toast]);


  useEffect(() => {
    if (VAPI_API_KEY) {
      const client = new VapiClient(VAPI_API_KEY);
      setVapiClient(client);
    }
    if (selectedFlowId) {
      loadFlow(selectedFlowId);
    }
    if (!selectedFlowId) {
      setNodes([]);
      setEdges([]);
      setCurrentFlowId(null);
    }
  }, [selectedFlowId, loadFlow, onFlowDeleted]);




  const onUpdateNode = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onUpdateNodevapi = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
    if (data.setVapi) {
      setDefaultCall(data.setVapi);
    }
  }, [setNodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
  }, []);

  const closeNodeInfo = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const onUpdateLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onAddNode = useCallback((nodeType: string) => {
    const existingNodes = getNodes();
    const { zoom } = getViewport();

    let newPosition;
    if (existingNodes.length > 0) {
      const lastNode = existingNodes[existingNodes.length - 1];
      newPosition = {
        x: lastNode.position.x + 150 / zoom,
        y: lastNode.position.y
      };
    } else {
      newPosition = { x: 199.09151622227262, y: 80.00000000000006 };
    }

    const newNode = {
      id: `${existingNodes.length + 1}`,
      type: 'custom',
      position: newPosition,
      data: {
        label: `${nodeType}`,
        onUpdateLabel,
        nodeType: nodeType
      },
      selected: false,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [getNodes, getViewport, setNodes, onUpdateLabel]);

  const onRemoveNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null); // Clear the selected node after deletion
  }, [setNodes, setEdges]);

  const onSaveAs = useCallback(async () => {
    try {
      const flowName = prompt("Enter a name for this flow:");
      if (!flowName) return;

      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: flowName, nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      const savedFlow = await response.json();
      setCurrentFlowId(savedFlow.id);
      toast({
        title: "Success",
        description: `Flow "${flowName}" saved`,
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });

      onFlowSaved(savedFlow);
      setFlowName(savedFlow.name || "Untitled Flow");
      setLastEditTime(new Date(savedFlow.updatedAt || savedFlow.createdAt));
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow. Please try again.",
        variant: "destructive",
      });
    }

  }, [nodes, edges, toast, onFlowSaved]);

  const onSave = useCallback(async () => {
    if (!currentFlowId) {
      onSaveAs();
      return;
    }

    try {
      const response = await fetch(`/api/flows/${currentFlowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flow');
      }

      const updatedFlow = await response.json();
      toast({
        title: "Success",
        description: `Flow updated successfully`,
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });

      onFlowSaved(updatedFlow);
      setFlowName(updatedFlow.name || "Untitled Flow");
      setLastEditTime(new Date(updatedFlow.updatedAt || updatedFlow.createdAt));
    } catch (error) {
      console.error('Error updating flow:', error);
      toast({
        title: "Error",
        description: "Failed to update flow. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentFlowId, nodes, edges, toast, onFlowSaved, onSaveAs]);


  const onPublish = useCallback(async () => {
    const vapiNode: any = nodes.find(node => node.data.nodeType === 'vapi');
    const llmChatPdfNode = nodes.find(node => node.data.nodeType === 'LLM Chat PDF');
    if (llmChatPdfNode) {
      if (!llmChatPdfNode.data.pdfFile) {
        setSelectedNode(llmChatPdfNode);
        toast({
          title: "Error",
          description: "Please upload a PDF file before running.",
          variant: "destructive",
        });
        
        return;
      }
      setShowChatDialog(true);
      return;
    }
    if (vapiNode) {
      console.log('GET PARAMS', defaultCall)

      if (!vapiClient) {
        toast({
          title: "Error",
          description: "Vapi client is not initialized.",
          duration: 3000,
          variant: "destructive",
        });
        return;
      }
      try {
        // error vapi client api key limit 10 per mhoont
        const call = await vapiClient.start({
          model: {
            provider: defaultCall.model.provider,
            model: defaultCall.model.model,
            temperature: defaultCall.model.temperature,
            messages: [
              {
                role: defaultCall.model.messages[0].role,
                content: defaultCall.model.messages[0].content,
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: defaultCall.voice.voiceId,
          },

        });
        vapiClient.on('call-start', () => toast({ title: "Call Status", description: "Ringing..." }));
        vapiClient.on('speech-start', () => toast({ title: "Call Status", description: "Connected" }));
        vapiClient.on('call-end', () => toast({ title: "Call Status", description: "Call ended" }));

        // setShowChatDialog(true);
      } catch (error) {
        console.error('Error starting VAPI call:', error);
        toast({
          title: "Error",
          description: "Failed to start the VAPI call. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setShowChatDialog(true);
    }
  }, [nodes, vapiClient, toast]);
  const onCreateNewFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentFlowId(null);
    setFlowName("Untitled Flow");
    setLastEditTime(new Date());
    onFlowSaved(null); // This will signal the parent component to clear the selected flow
  }, [onFlowSaved]);

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node, nodes: Node[]) => {
      //   console.log('Node dragged:', node);
      // You can perform additional actions here if needed
    },
    []
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node, nodes: Node[]) => {
      //   console.log('Node is being dragged:', node);
    },
    []
  );


  const nodeTypeList = [
    { type: 'Start', label: 'Start' },
    { type: 'LLM Antonim', label: 'LLM Antonim' },
    { type: 'Output', label: 'Output' },
    { type: 'vapi', label: 'Vapi' },
    { type: 'LLM Chat', label: 'LLM Chat' },
    { type: 'LLM Chat PDF', label: 'LLM Chat PDF' },
    // Add more node types here as needed
  ];


  return (
    <div className="w-full  flex flex-col relative">

      <Card className="flex-1 overflow-hidden shadow-lg mb-[1vh]">
        <CardContent className="p-0 h-full">
          <div className="flex justify-between p-4 items-center h-[8vh]">
            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">{flowName}</h2>
              {lastEditTime && (
                <p className="text-xs text-gray-500">
                  Last edited: {format(lastEditTime, 'MMM d, yyyy HH:mm')}
                </p>
              )}
            </div>

            <div>
              <Button onClick={onCreateNewFlow} variant="ghost" className="ml-2 bg-[#656d70] hover:bg-blue-400 text-white" title="Create New Flow">
                <FileText className="h-5 w-5" />
              </Button>
              <Button onClick={onSave} variant="ghost" className="ml-2 bg-[#656d70] hover:bg-blue-400 text-white" title="Save">
                <Save className="h-5 w-5" />
              </Button>
              {/* <Button onClick={onSaveAs} variant="ghost" className="ml-2 bg-blue-500 hover:bg-blue-400 text-white" title="Save As">
                <SaveAll className="h-5 w-5" />
              </Button> */}
              <Button onClick={onPublish} variant="ghost" className="ml-2  items-center bg-blue-500 hover:bg-blue-400 text-white">
                <Play className="h-5 w-5 mr-2" />
                Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden shadow-lg">
        <CardContent className="p-0 h-full">
          <div className='h-[75vh]'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="bg-blue-500 h-[5vh] w-[2.3vw] flex justify-center items-center text-white hover:bg-blue-600 absolute left-[1vw] top-[12vh] z-[99999] rounded-full" title="Add new node">
                  <Plus className="w-6 h-6" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[999999]">
                {nodeTypeList.map((nodeType) => (
                  <DropdownMenuItem key={nodeType.type} onSelect={() => onAddNode(nodeType.type)}>
                    {nodeType.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedNode && (
              <div
                title='Remove Node'
                onClick={() => onRemoveNode(selectedNode.id)}
                className="absolute top-[20vh] left-[1vw]  z-[99] bg-red-600 h-[5vh] w-[2.3vw] flex justify-center items-center text-white hover:bg-red-500 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDrag={onNodeDrag}
              onNodeDragStop={onNodeDragStop}
              onPaneClick={closeNodeInfo}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              proOptions={proOptions}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              className="flex-grow"
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
            </ReactFlow>
            {selectedNode && selectedNode.data.nodeType === 'vapi' ? (
              <NodeInfoCardVapi
                node={selectedNode as Node<NodeData & Record<string, unknown>>}
                onClose={closeNodeInfo}
                onUpdateNode={onUpdateNodevapi}
              />
            ) : selectedNode && selectedNode.data.nodeType === 'LLM Chat PDF' ? (
              <NodeInfoCardDoc
                node={selectedNode as Node<NodeData & Record<string, unknown>>}
                onClose={closeNodeInfo}
                onUpdateNode={onUpdateNode}
              />
            )        : selectedNode && (
              <NodeInfoCard
                node={selectedNode as Node<NodeData & Record<string, unknown>>}
                onClose={closeNodeInfo}
                onUpdateNode={onUpdateNode}
              />
            )}
            {showChatDialog && (
              <ChatDialog
                onClose={() => setShowChatDialog(false)}
                selectedNode={selectedNode}
                nodes={nodes}
                edges={edges}
              />
            )}
          </div>

        </CardContent>
      </Card>


      <Toaster />
    </div>
  );
}