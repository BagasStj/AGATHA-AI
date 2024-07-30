'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge, Connection, NodeTypes, EdgeTypes, BackgroundVariant, applyNodeChanges, applyEdgeChanges, useReactFlow, Viewport, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeInfoCard from './components/NodeInfoCard';
import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";


interface NodeData {
  label: string;
  onUpdateLabel: (id: string, label: string) => void;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode as unknown as NodeTypes['custom'],
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  // { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
];


export default function FlowComponentWrapper({ selectedFlowId, onFlowSaved }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void }) {
  return (
    <ReactFlowProvider>
      <FlowComponent selectedFlowId={selectedFlowId} onFlowSaved={onFlowSaved} />
    </ReactFlowProvider>
  );
}

function FlowComponent({ selectedFlowId, onFlowSaved }: { selectedFlowId: string | null, onFlowSaved: (flow: any) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { getNodes, getViewport } = useReactFlow();
  const { toast } = useToast();

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
    if (selectedFlowId) {
      loadFlow(selectedFlowId);
    }
  }, [selectedFlowId, loadFlow]);



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

  const onAddNode = useCallback(() => {
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
        label: existingNodes.length === 0 ? 'Start' : `Node ${existingNodes.length + 1}`,
        onUpdateLabel
      },
      selected: false,
    };
    setNodes((nds) => nds.concat(newNode));
  }, [getNodes, getViewport, setNodes, onUpdateLabel]);

  const onRemoveNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onSave = useCallback(async () => {
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
      toast({
        title: "Success",
        description: `Flow "${flowName}" saved`,
        duration: 3000,
        className: "bg-green-100 border-green-400 text-green-700",
      });
  
      // Call the onFlowSaved prop with the saved flow data
      onFlowSaved(savedFlow);
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow. Please try again.",
        variant: "destructive",
      });
    }
  }, [nodes, edges, toast, onFlowSaved]);



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



  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between p-4">
        <div>
          <button onClick={onAddNode} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Add Node</button>
          <button onClick={() => onRemoveNode(selectedNode?.id ?? '')} className="px-4 py-2 bg-red-500 text-white rounded  mr-2">Remove Node</button>
          <button onClick={onSave} className="px-4 py-2 bg-green-500 text-white rounded ">Save Flow</button>
        </div>
      </div>
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
      <NodeInfoCard
        node={selectedNode as Node<NodeData & Record<string, unknown>> | null}
        onClose={closeNodeInfo}
        onUpdateNode={onUpdateNode}
      />
      <Toaster />
    </div>
  );
}