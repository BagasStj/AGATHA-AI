import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

function CustomNode({ data, selected }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-teal-500" />
      <div className="font-bold">{data.label}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-teal-500" />
    </div>
  );
}

export default memo(CustomNode);