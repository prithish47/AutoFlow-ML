import { useState, useEffect } from 'react';
import { pipelineAPI } from '../utils/api';
import { usePipeline } from '../context/PipelineContext';

export default function PipelineManager({ onClose }) {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const { loadPipeline } = usePipeline();

    useEffect(() => {
        fetchPipelines();
    }, []);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
                    <div>
                        <h2 className="text-sm font-bold text-white">My Pipelines</h2>
                        <p className="text-[10px] text-[var(--text-muted)]">Load or manage your saved pipelines</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Pipeline List */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-8">
                            <svg className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-xs text-[var(--text-muted)]">Loading...</p>
                        </div>
                    ) : pipelines.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl opacity-50">📂</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">No saved pipelines yet</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">Create a pipeline and save it to see it here</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pipelines.map(p => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] hover:border-indigo-500/30 hover:bg-[var(--bg-hover)] transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-semibold text-white truncate">{p.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    p.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                                }`}>
                                                {p.status || 'draft'}
                                            </span>
                                            <span className="text-[9px] text-[var(--text-muted)]">
                                                {new Date(p.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleLoad(p._id)}
                                            className="px-3 py-1 text-[10px] font-medium rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id)}
                                            className="px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            🗑
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
