import { FREE_TIER_LIMITS } from '../utils/nodeDefinitions';
import { usePipeline } from '../context/PipelineContext';
import { Zap, Crown } from 'lucide-react';

export default function FreeTierBanner() {
    const { nodes } = usePipeline();
    const nodeCount = nodes.length;
    const limit = FREE_TIER_LIMITS.maxNodesPerWorkflow;
    const progress = Math.min((nodeCount / limit) * 100, 100);

    return (
        <div className="select-none p-5 rounded-2xl bg-white border border-black/5 relative overflow-hidden group shadow-sm">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full" />

            {/* Usage Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Crown size={14} className="text-[#d97706]" />
                    <span className="text-[10px] font-black text-[#d97706] uppercase tracking-widest">Growth Plan</span>
                </div>
                <span className="text-[9px] font-black text-[#64748b] tabular-nums uppercase">{nodeCount}/{limit}</span>
            </div>

            {/* Progress Meter */}
            <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden mb-4 p-0">
                <div
                    className={`h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${progress >= 80 ? 'bg-amber-500' : 'bg-[#2563eb]'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Usage Constraints */}
            <div className="grid grid-cols-2 gap-y-3 mb-6">
                {[
                    { label: 'Dataset', val: `${FREE_TIER_LIMITS.maxDatasetSizeMB}MB` },
                    { label: 'Compute', val: 'Low' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[8px] font-bold text-[#94a3b8] uppercase tracking-widest mb-0.5">{item.label}</span>
                        <span className="text-[10px] font-bold text-[#475569]">{item.val}</span>
                    </div>
                ))}
            </div>

            {/* Upgrade CTA */}
            <button className="w-full h-10 border border-[#d97706]/20 bg-[#fffbeb] hover:bg-[#fef3c7] rounded-xl text-[10px] font-black text-[#d97706] uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md">
                <Zap size={10} className="fill-current" />
                Upgrade Engine
            </button>
        </div>
    );
}
