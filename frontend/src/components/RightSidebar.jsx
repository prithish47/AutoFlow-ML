import { useState } from 'react';
import { Settings2, BrainCircuit } from 'lucide-react';
import ConfigPanel from './ConfigPanel';
import ExplanationPanel from './ExplanationPanel';

export default function RightSidebar() {
    const [activeTab, setActiveTab] = useState('config'); // 'config' | 'explain'

    return (
        <div className="flex flex-col h-full bg-[#ffffff]">
            {/* Top Tabs */}
            <div className="flex border-b border-black/5">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'config'
                            ? 'text-[#2563eb] border-b-2 border-[#2563eb] bg-[#f8fafc]'
                            : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                        }`}
                >
                    <Settings2 size={14} />
                    Properties
                </button>
                <button
                    onClick={() => setActiveTab('explain')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'explain'
                            ? 'text-[#2563eb] border-b-2 border-[#2563eb] bg-[#f8fafc]'
                            : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
                        }`}
                >
                    <BrainCircuit size={14} />
                    Explain
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'config' ? <ConfigPanel /> : <ExplanationPanel />}
            </div>
        </div>
    );
}
