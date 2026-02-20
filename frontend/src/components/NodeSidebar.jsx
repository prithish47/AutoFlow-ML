import { useState } from 'react';
import { NODE_TYPES, CATEGORIES } from '../utils/nodeDefinitions';
import FreeTierBanner from './FreeTierBanner';

export default function NodeSidebar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(
        Object.keys(CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
    );

    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const filteredCategories = Object.entries(CATEGORIES).map(([id, cat]) => {
        const nodes = Object.values(NODE_TYPES).filter(node =>
            node.category === id &&
            node.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { id, ...cat, nodes };
    });

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden border-r border-slate-100 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] transition-all">
            {/* Search Section */}
            <div className="px-5 pt-8 pb-4 border-b border-zinc-100">
                <div className="relative group">
                    <svg className="absolute left-3 top-[11px] w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search blocks..."
                        className="w-full pl-9 pr-4 h-9 rounded-md bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all text-[13px] font-medium text-zinc-900 placeholder:text-zinc-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Blocks Library */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5 space-y-8">
                    {filteredCategories.map(category => (
                        <div key={category.id} className="space-y-4">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                        {category.label}
                                    </span>
                                </div>
                                <svg
                                    className={`w-3.5 h-3.5 text-zinc-300 transition-transform ${expandedCategories[category.id] ? 'rotate-0' : '-rotate-90'}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {expandedCategories[category.id] && (
                                <div className="grid grid-cols-1 gap-1">
                                    {category.nodes.length > 0 ? (
                                        category.nodes.map(node => (
                                            <div
                                                key={node.id}
                                                draggable
                                                onDragStart={(e) => onDragStart(e, node.id)}
                                                className="h-9 flex items-center gap-3 px-3 rounded-md hover:bg-zinc-100 cursor-grab active:cursor-grabbing transition-colors group"
                                            >
                                                <span className="text-[16px] w-5 text-center">{node.icon}</span>
                                                <span className="text-[13px] font-medium text-zinc-600 group-hover:text-zinc-900 truncate">
                                                    {node.label}
                                                </span>
                                            </div>
                                        ))
                                    ) : searchTerm && (
                                        <div className="py-4 text-center border border-dashed border-zinc-100 rounded-md">
                                            <p className="text-[11px] text-zinc-400">No results</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pro Extensions */}
                    <div className="pt-6 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Enterprise</h3>
                            <span className="text-[9px] font-bold text-zinc-300 border border-zinc-200 px-1.5 py-0.5 rounded">PRO</span>
                        </div>
                        <div className="space-y-1 opacity-50 grayscale pointer-events-none">
                            {[
                                { name: 'Anomaly Explorer', icon: '🔮' },
                                { name: 'Neural Fabric', icon: '🧠' },
                                { name: 'Visual Cortex', icon: '👁️' }
                            ].map(feat => (
                                <div key={feat.name} className="h-9 flex items-center gap-3 px-3">
                                    <span className="text-[16px] w-5 text-center">{feat.icon}</span>
                                    <span className="text-[13px] font-medium text-zinc-400">{feat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex-shrink-0">
                <FreeTierBanner />
            </div>
        </div>
    );
}

