import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

const CustomNode = ({ data, selected }) => {
    return (
        <div className={`transition-all duration-200 ${selected ? 'z-50' : 'z-0'}`}>
            <div className={`
                relative min-w-[200px] bg-white rounded-xl border transition-all
                ${selected
                    ? 'border-zinc-900 shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)] ring-4 ring-zinc-50'
                    : 'border-zinc-200 shadow-sm hover:border-zinc-300'
                } 
                overflow-hidden
            `}>
                {/* Minimal Header */}
                <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-100">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {data.category}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'success' ? 'bg-emerald-500' :
                            data.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                data.status === 'failed' ? 'bg-red-500' : 'bg-zinc-200'
                        }`} />
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-[20px]">
                            {data.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-semibold text-zinc-900 truncate tracking-tight">
                                {data.label}
                            </h3>
                            <p className="text-[10px] font-medium text-zinc-400">
                                {selected ? 'Active Instance' : 'Ready'}
                            </p>
                        </div>
                    </div>

                    {/* Simple Footer Metadata */}
                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-50">
                        <span className="text-[9px] font-medium text-zinc-300 uppercase tracking-tighter">
                            V2.4.0
                        </span>
                    </div>
                </div>

                {/* Refined Handles */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-2 !h-2 !-left-1 !border-2 !border-white !bg-zinc-300 hover:!bg-zinc-900 transition-colors"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-2 !h-2 !-right-1 !border-2 !border-white !bg-zinc-300 hover:!bg-zinc-900 transition-colors"
                />
            </div>
        </div>
    );
};

export default memo(CustomNode);
