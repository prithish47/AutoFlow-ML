import { useState, useCallback, useEffect } from 'react';
import { usePipeline } from '../context/PipelineContext';
import MetricsDashboard from './MetricsDashboard';

export default function ExecutionPanel() {
    const { logs, results, executionState } = usePipeline();
    const [activeTab, setActiveTab] = useState('logs');
    const [isMinimized, setIsMinimized] = useState(false);
    const [panelHeight, setPanelHeight] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing) {
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 100 && newHeight < window.innerHeight - 200) {
                setPanelHeight(newHeight);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    if (isMinimized) {
        return (
            <div
                className="h-9 bg-white border-t border-zinc-200 flex items-center justify-between px-6 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${executionState === 'running' ? 'bg-blue-500 animate-pulse' :
                        executionState === 'completed' ? 'bg-emerald-500' :
                            executionState === 'failed' ? 'bg-red-500' : 'bg-zinc-200'
                        }`} />
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Console</span>
                </div>
                <button className="text-[10px] font-medium text-zinc-400">Expand</button>
            </div>
        );
    }

    return (
        <div
            style={{ height: panelHeight }}
            className="bg-white border-t border-zinc-200 flex flex-col relative z-40"
        >
            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/30 transition-colors z-50"
            />

            {/* Navigation Header */}
            <div className="h-11 px-6 flex items-center justify-between border-b border-zinc-100 select-none">
                <div className="flex items-center gap-8 h-full">
                    {[
                        { id: 'logs', label: 'Console' },
                        { id: 'metrics', label: 'Metrics' },
                        { id: 'data', label: 'Data' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`h-full flex items-center text-[11px] font-medium transition-colors relative ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <span className="uppercase tracking-wider">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-zinc-900" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {results?.model_download_available && (
                        <button
                            onClick={() => window.open(`/api/execute/download-model/${results.model_file_id}`)}
                            className="flex items-center gap-2 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md transition-all active:scale-95 shadow-premium"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-tight">Download Model</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 rounded-md border border-zinc-200/50">
                        <div className={`w-1.5 h-1.5 rounded-full ${executionState === 'running' ? 'bg-blue-500 animate-pulse' :
                            executionState === 'completed' ? 'bg-emerald-500' :
                                executionState === 'failed' ? 'bg-red-500' : 'bg-zinc-300'
                            }`} />
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-tighter">
                            {executionState === 'running' ? 'Active' :
                                executionState === 'completed' ? 'Success' :
                                    executionState === 'failed' ? 'Error' : 'Standby'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded hover:bg-zinc-100 transition-colors text-zinc-400"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Central Region */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {activeTab === 'logs' && (
                    <div className="h-full font-mono">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                                <p className="text-[12px] font-medium uppercase tracking-[0.2em]">No logs generated</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-0.5">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 py-0.5 px-2 hover:bg-zinc-50 rounded transition-colors text-[12px]">
                                        <span className="text-zinc-300 shrink-0 tabular-nums">
                                            {log.time}
                                        </span>
                                        <span className={`flex-1 ${log.type === 'error' ? 'text-red-500 font-semibold' :
                                            log.type === 'success' ? 'text-emerald-600 font-semibold' :
                                                log.type === 'progress' ? 'text-blue-600' : 'text-zinc-600'
                                            }`}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'metrics' && (
                    <div className="p-8 h-full bg-zinc-50/20">
                        <MetricsDashboard results={results} />
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="p-6">
                        {results?.preview ? (
                            <div className="border border-zinc-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left border-collapse bg-white">
                                    <thead>
                                        <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                            {Object.keys(results.preview[0] || {}).map(key => (
                                                <th key={key} className="px-4 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {results.preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} className="px-4 py-2 text-[12px] text-zinc-600 tabular-nums">
                                                        {typeof val === 'number' ? val.toFixed(4) : String(val)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-zinc-300">
                                <p className="text-[11px] font-medium uppercase tracking-widest">Awaiting dataset preview</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Diagnostic Footer */}
            <div className="h-8 flex items-center px-6 gap-6 border-t border-zinc-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Ready</span>
                    </div>
                    <div className="h-3 w-[1px] bg-zinc-100" />
                    <span className="text-[9px] font-medium text-zinc-300 uppercase">Memory: 1.2GB / 8GB</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-[9px] font-medium text-zinc-300 uppercase tracking-tighter">v2.4.0-STABLE</span>
                </div>
            </div>
        </div>
    );
}
