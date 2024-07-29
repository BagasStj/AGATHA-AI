'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Node, Edge, Connection, NodeTypes, EdgeTypes, BackgroundVariant, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Input Node' } },
  { id: '2', type: 'default', position: { x: 100, y: 100 }, data: { label: 'Default Node' } },
  { id: '3', type: 'output', position: { x: 200, y: 200 }, data: { label: 'Output Node' } },
  { id: '4', type: 'custom', position: { x: 300, y: 300 }, data: { label: 'Custom Node' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
];

export default function FlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [selectedNode, setSelectedNode] : any = useState<Node | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const onAddNode = useCallback(() => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'custom',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const onRemoveNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onSave = useCallback(() => {
    const flow = { nodes, edges };
    localStorage.setItem('flow', JSON.stringify(flow));
    alert('Flow saved to local storage');
  }, [nodes, edges]);

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
        <button onClick={onAddNode} className="px-4 py-2 bg-blue-500 text-white rounded">Add Node</button>
        <button onClick={onSave} className="px-4 py-2 bg-green-500 text-white rounded">Save Flow</button>
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        fitView
        className="flex-grow"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Lines} gap={12} size={1} />
      </ReactFlow>
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow z-10">
          <h3>Selected Node: {selectedNode.data.label}</h3>
          <p>ID: {selectedNode.id}</p>
          <button onClick={() => onRemoveNode(selectedNode.id)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">Remove Node</button>
        </div>
      )}
    </div>
  );
}