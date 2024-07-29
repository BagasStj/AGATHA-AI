import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  onUpdateLabel: (id: string, label: string) => void;
}

interface CustomNodeProps extends Omit<NodeProps, 'data'> {
  data: CustomNodeData;
  selected: boolean;
}

function CustomNode({ id, data, isConnectable, selected }: CustomNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(evt.target.value);
  };

  const onEditEnd = () => {
    setIsEditing(false);
    data.onUpdateLabel(id, label);
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2 h-2 !bg-teal-500" />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={onLabelChange}
          onBlur={onEditEnd}
          className="nodrag"
          autoFocus
        />
      ) : (
        <div className="font-bold" onDoubleClick={() => setIsEditing(true)}>{data.label}</div>
      )}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2 h-2 !bg-teal-500" />
    </div>
  );
}

export default memo(CustomNode);