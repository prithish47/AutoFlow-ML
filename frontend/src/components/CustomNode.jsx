import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
import { Check, AlertCircle, Loader2, Database, Brain, Cpu, BarChart3, Settings2 } from 'lucide-react';
import { NODE_TYPES } from '../utils/nodeDefinitions';

const icons = {
    input: Database,
    prep: Cpu,
    model: Brain,
    eval: BarChart3,
};

const categoryColors = {
    input: 'text-blue-600',
    prep: 'text-purple-600',
    model: 'text-amber-600',
    eval: 'text-emerald-600',
};

const CustomNode = ({ data, selected }) => {
    const nodeDefinition = NODE_TYPES[data.nodeType];

    if (!nodeDefinition) {
        console.warn("Unknown node type:", data.nodeType);
        return null; // prevent crash
    }

    const Icon = icons[data.category] || Settings2;
    const isRunning = data.status === 'running';
    const isSuccess = data.status === 'success';
    const isError = data.status === 'failed';

    const inputs = data.inputs || [];
    const outputs = data.outputs || [];

    const getStateStyles = () => {
        if (isRunning) return 'border-[#2563eb] shadow-[0_4px_12px_rgba(37,99,235,0.15)] bg-white';
        if (isSuccess) return 'border-[#16a34a]/30 bg-white';
        if (isError) return 'border-[#dc2626]/30 bg-white';
        return selected ? 'border-[#2563eb]/60 bg-white' : 'border-black/5 bg-white';
    };

    return (
        <div className={`
            group relative min-w-[220px] transition-all duration-300 transform
            ${selected ? 'z-50 scale-[1.02]' : 'z-0 scale-100'}
        `}>
            {/* Main Node Card */}
            <div className={`
                relative border rounded-xl transition-all duration-300
                overflow-visible node-shadow group-hover:node-shadow-hover
                ${getStateStyles()}
            `}>
                {/* Header Section */}
                <div className="flex items-center gap-2.5 p-3 border-b border-black/[0.03]">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center 
                        bg-[#f8fafc] border border-black/5
                        ${categoryColors[data.category] || 'text-[#64748b]'}
                    `}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-[#0f172a] truncate leading-tight">
                            {data.label}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider ${categoryColors[data.category] || 'text-[#94a3b8]'}`}>
                                {data.category}
                            </span>
                        </div>
                    </div>
                    {isError && <AlertCircle size={14} className="text-[#dc2626]" />}
                </div>

                {/* Status Bar */}
                <div className="px-3 py-2 flex items-center justify-between bg-[#f8fafc]/50 rounded-b-xl border-t border-black/[0.02]">
                    <div className="flex items-center gap-2">
                        {isRunning ? (
                            <Loader2 size={12} className="text-[#2563eb] animate-spin" />
                        ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ring-[1.5px] ring-black/5 ${isSuccess ? 'bg-[#16a34a]' :
                                isError ? 'bg-[#dc2626]' : 'bg-[#94a3b8]'
                                }`} />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${isRunning ? 'text-[#2563eb]' :
                            isSuccess ? 'text-[#16a34a]' :
                                isError ? 'text-[#dc2626]' : 'text-[#64748b]'
                            }`}>
                            {data.status || 'Ready'}
                        </span>
                    </div>
                    {isSuccess && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#16a34a] text-white">
                            <Check size={8} strokeWidth={4} />
                            <span className="text-[8px] font-black uppercase">SUCCESS</span>
                        </div>
                    )}
                </div>

                {/* Input Handles */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-6 py-2">
                    {inputs.map((input, idx) => (
                        <div key={`input-${idx}`} className="relative flex items-center">
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={input}
                                className="!w-3.5 !h-3.5 !-left-[7px] !border-[3px] !border-white !bg-[#e2e8f0] hover:!bg-[#2563eb] hover:!scale-125 transition-all !shadow-sm"
                            />
                            <div className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-[10px] font-bold text-[#64748b] bg-white border border-black/5 px-2 py-0.5 rounded shadow-sm">
                                    {input}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Output Handles */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-6 py-2">
                    {outputs.map((output, idx) => (
                        <div key={`output-${idx}`} className="relative flex items-center justify-end">
                            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-right">
                                <span className="text-[10px] font-bold text-[#64748b] bg-white border border-black/5 px-2 py-0.5 rounded shadow-sm">
                                    {output}
                                </span>
                            </div>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={output}
                                className="!w-3.5 !h-3.5 !-right-[7px] !border-[3px] !border-white !bg-[#e2e8f0] hover:!bg-[#2563eb] hover:!scale-125 transition-all !shadow-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Selection Glow */}
            {selected && (
                <div className="absolute -inset-[1px] border-2 border-[#2563eb]/40 rounded-xl pointer-events-none animate-pulse" />
            )}
        </div>
    );
};

export default memo(CustomNode);
