import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Home, CheckSquare, Phone, Brain ,Goal } from 'lucide-react';

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'Start':
      return <Home className="w-4 h-4 text-white" />;
    case 'END':
      return <Goal className="w-4 h-4 text-white" />;
    case 'vapi':
      return <Phone className="w-4 h-4 text-white" />;
    default:
      return <Brain className="w-4 h-4 text-white" />;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'Start':
      return 'bg-blue-500';
    case 'END':
      return 'bg-orange-500';
    case 'vapi':
      return 'bg-green-500';
    default:
      return 'bg-purple-500';
  }
};

const CustomNode = ({ data }: { data: any }) => {
  const isStartOrEnd = data.nodeType === 'Start' || data.nodeType === 'END';
  const nodeWidth = isStartOrEnd ? 'w-[20vw]' : 'w-[18vw]';

  return (
    <div className={`px-4 py-2 shadow-md rounded-3xl bg-white border-2 border-stone-400 ${nodeWidth}`}>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full ${getNodeColor(data.nodeType)} flex items-center justify-center mr-2`}>
          {getNodeIcon(data.nodeType)}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.label}</div>
          {!isStartOrEnd && <div className="text-gray-500">{data.nodeType}</div>}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Right} className="w-16 !bg-teal-500" />
    </div>
  );
};

export default memo(CustomNode);