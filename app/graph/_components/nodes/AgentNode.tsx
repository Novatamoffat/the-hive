import { Icon } from '@/components/ui/icon';
import { IconName } from '@/types';
import { Handle, Position } from '@xyflow/react';

interface AgentNodeProps {
  data: {
    icon: IconName;
    name: string;
  };
}

const AgentNode = ({ data }: AgentNodeProps) => {
  return (
    <div className="p-2 h-32 w-32 shadow-lg rounded-full bg-neutral-800 border-1 border-brand-500/20">
      <Handle type="source" position={Position.Right} className="" />
      <div className="flex flex-col items-center justify-center h-full w-full">
        <Icon name={data.icon} className="w-10 h-10" />
        <span className="text-sm font-semibold text-white text-center">{data.name}</span>
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-teal-500" />
    </div>
  );
};

export default AgentNode; 