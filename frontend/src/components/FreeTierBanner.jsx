import { FREE_TIER_LIMITS } from '../utils/nodeDefinitions';
import { usePipeline } from '../context/PipelineContext';

export default function FreeTierBanner() {
    const { nodes } = usePipeline();
    const nodeCount = nodes.length;
    const limit = FREE_TIER_LIMITS.maxNodesPerWorkflow;
    const progress = Math.min((nodeCount / limit) * 100, 100);

    return (
        <div className="mt-auto px-6 pb-6 select-none border-t border-slate-50 pt-8 bg-white">
            {/* Usage Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Growth Plan</span>
                <span className="text-[10px] font-bold text-slate-400">{nodeCount}/{limit} Nodes</span>
            </div>

            {/* Premium Meter */}
            <div className="h-2 bg-slate-50 rounded-full overflow-hidden mb-6 p-[2px] border border-slate-100/50">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,102,255,0.2)] ${progress >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Usage Constraints */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-4 mb-8">
                {[
                    { label: 'Dataset', val: `${FREE_TIER_LIMITS.maxDatasetSizeMB}MB` },
                    { label: 'Rows', val: '10K' },
                    { label: 'Timeout', val: '30s' },
                    { label: 'Parallel', val: '1' }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{item.label}</span>
                        <span className="text-[11px] font-black text-slate-700">{item.val}</span>
                    </div>
                ))}
            </div>

            {/* Upgrade CTA */}
            <button className="w-full h-11 bg-slate-900 hover:bg-black rounded-xl text-[12px] font-bold text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.97]">
                Upgrade to Pro
            </button>
        </div>
    );
}


