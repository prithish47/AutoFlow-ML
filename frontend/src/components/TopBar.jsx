import { useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { useAuth } from '../context/AuthContext';
import PipelineManager from './PipelineManager';

export default function TopBar() {
    const {
        pipelineName, setPipelineName, runPipeline, savePipeline,
        executionState, clearPipeline
    } = usePipeline();

    const { user, logout } = useAuth();
    const [saving, setSaving] = useState(false);
    const [showPipelineManager, setShowPipelineManager] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleRun = async () => {
        try {
            await runPipeline();
        } catch (err) {
            console.error('Execution failed:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await savePipeline();
        } catch (err) {
            console.error('Save failed:', err);
        }
        setSaving(false);
    };

    return (
        <>
            <header className="h-12 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-[100]">
                {/* Left: Brand & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 pr-4 border-r border-zinc-100">
                        <svg className="w-5 h-5 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-semibold text-[13px] tracking-tight">FlowML</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <input
                                autoFocus
                                className="h-7 px-2 rounded bg-zinc-50 border border-zinc-300 focus:outline-none focus:border-zinc-500 text-[13px] font-medium min-w-[150px]"
                                value={pipelineName}
                                onChange={(e) => setPipelineName(e.target.value)}
                                onBlur={() => setIsEditing(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded hover:bg-zinc-50 transition-colors"
                            >
                                <span className="text-[13px] font-medium text-zinc-900">{pipelineName}</span>
                                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Draft</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Main Controls */}
                <div className="flex items-center gap-1 bg-zinc-50 p-0.5 rounded-lg border border-zinc-200">
                    <button
                        onClick={() => setShowPipelineManager(true)}
                        className="h-7 px-3 flex items-center gap-2 rounded-md hover:bg-white hover:shadow-sm text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-all"
                    >
                        Open
                    </button>
                    <button
                        onClick={clearPipeline}
                        className="h-7 px-3 flex items-center gap-2 rounded-md hover:bg-white hover:shadow-sm text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-all"
                    >
                        New
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="h-7 px-3 flex items-center gap-2 rounded-md hover:bg-white hover:shadow-sm text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-all disabled:opacity-30"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>

                {/* Right: User & Run */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRun}
                        disabled={executionState === 'running'}
                        className={`
                            h-8 px-4 text-[12px] font-semibold rounded-md border transition-all active:scale-[0.98]
                            ${executionState === 'running'
                                ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-wait'
                                : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800'
                            }
                        `}
                    >
                        {executionState === 'running' ? 'Running...' : 'Run Pipeline'}
                    </button>

                    <div className="h-4 w-[1px] bg-zinc-200 mx-1" />

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-600 hover:bg-zinc-200 transition-colors"
                        >
                            {user?.name?.charAt(0) || 'U'}
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-[40px] w-56 bg-white border border-zinc-200 rounded-lg shadow-xl p-1 z-[110] animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="px-3 py-2 border-b border-zinc-50 mb-1">
                                    <p className="text-[12px] font-semibold text-zinc-900 truncate">{user?.name}</p>
                                    <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50 rounded transition-colors flex items-center gap-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {showPipelineManager && (
                <PipelineManager onClose={() => setShowPipelineManager(false)} />
            )}
        </>
    );
}

