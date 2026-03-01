import { useState, useEffect } from 'react';
import { pipelineAPI } from '../utils/api';
import { usePipeline } from '../context/PipelineContext';

export default function PipelineManager({ onClose }) {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const { loadPipeline } = usePipeline();

    const fetchPipelines = async () => {
        setLoading(true);
        try {
            const res = await pipelineAPI.list();
            setPipelines(res.data.pipelines || []);
        } catch (err) {
            console.error('Failed to load pipelines:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPipelines();
    }, []);

    const handleLoad = async (id) => {
        try {
            await loadPipeline(id);
            onClose();
        } catch (err) {
            console.error('Failed to load pipeline:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await pipelineAPI.delete(id);
            setPipelines(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete pipeline:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-[4px] animate-fade-in p-4">
            <div className="bg-[#ffffff] border border-black/5 rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
                    <div>
                        <h2 className="text-[18px] font-bold text-[#0f172a] tracking-tight">My Pipelines</h2>
                        <p className="text-[12px] font-medium text-[#64748b]">Load or manage your saved pipelines</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-black/5 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Pipeline List */}
                <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10">
                            <svg className="w-6 h-6 text-[#2563eb] animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-[12px] font-medium text-[#64748b]">Loading your pipelines...</p>
                        </div>
                    ) : pipelines.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-black/5 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <span className="text-2xl grayscale opacity-50">📂</span>
                            </div>
                            <p className="text-[13px] font-bold text-[#0f172a] mb-1">No saved pipelines yet</p>
                            <p className="text-[11px] font-medium text-[#64748b]">Create a pipeline and hit Save to see it here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pipelines.map(p => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 bg-[#ffffff] hover:bg-[#f8fafc] hover:border-[#2563eb]/20 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-[14px] font-bold text-[#0f172a] truncate mb-1">{p.name || 'Untitled Pipeline'}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-wider ${p.status === 'completed' ? 'bg-[#16a34a]/10 text-[#16a34a]' :
                                                p.status === 'failed' ? 'bg-[#dc2626]/10 text-[#dc2626]' :
                                                    'bg-black/5 text-[#64748b]'
                                                }`}>
                                                {p.status || 'draft'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-black/10"></span>
                                            <span className="text-[11px] font-medium text-[#94a3b8]">
                                                {new Date(p.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleLoad(p._id)}
                                            className="px-3.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm shadow-[#2563eb]/10 transition-colors"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id)}
                                            className="w-7 h-7 flex items-center justify-center text-[12px] text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#dc2626]/10 rounded-lg transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
