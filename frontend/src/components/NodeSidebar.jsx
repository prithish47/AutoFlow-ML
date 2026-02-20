import { useState } from 'react';
import { Search, ChevronDown, Database, Cpu, Brain, BarChart3, Zap, Cloud } from 'lucide-react';
import { NODE_TYPES, CATEGORIES, PRO_FEATURES } from '../utils/nodeDefinitions';
import FreeTierBanner from './FreeTierBanner';

const iconMap = {
    Database, Cpu, Brain, BarChart3, Zap, Cloud
};

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
        <div className="flex flex-col h-full bg-[#ffffff] overflow-hidden">
            {/* Search Section */}
            <div className="p-6 border-b border-black/5">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] transition-colors group-focus-within:text-[#2563eb]" />
                    <input
                        type="text"
                        placeholder="Search operations..."
                        className="w-full pl-10 pr-4 h-10 rounded-lg bg-[#f8fafc] border border-black/5 focus:outline-none focus:border-[#2563eb]/30 focus:bg-white transition-all text-[13px] font-medium text-[#0f172a] placeholder:text-[#94a3b8]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Blocks Library */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-8">
                    {filteredCategories.map(category => {
                        const Icon = iconMap[category.icon] || Database;
                        return (
                            <div key={category.id} className="space-y-4">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                                            {category.label}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-[#94a3b8] transition-transform duration-300 ${expandedCategories[category.id] ? 'rotate-0' : '-rotate-90'}`}
                                    />
                                </button>

                                {expandedCategories[category.id] && (
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {category.nodes.length > 0 ? (
                                            category.nodes.map(node => (
                                                <div
                                                    key={node.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, node.id)}
                                                    className="h-10 flex items-center gap-3 px-3 rounded-lg hover:bg-[#f1f5f9] cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-black/5 group"
                                                >
                                                    <Icon className="w-4 h-4 text-[#64748b] group-hover:text-[#2563eb] transition-colors" strokeWidth={1.5} />
                                                    <span className="text-[11px] font-bold text-[#475569] group-hover:text-[#0f172a] truncate">
                                                        {node.label}
                                                    </span>
                                                </div>
                                            ))
                                        ) : searchTerm && (
                                            <div className="py-4 text-center border border-dashed border-black/5 rounded-lg">
                                                <p className="text-[10px] text-[#94a3b8] font-mono">NO BLOCKS FOUND</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pro Extensions */}
                    <div className="pt-6 border-t border-black/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">PRO Extensions</h3>
                            <span className="text-[8px] font-bold text-[#2563eb] px-1.5 py-0.5 rounded bg-[#2563eb]/10 border border-[#2563eb]/20">ENTERPRISE</span>
                        </div>
                        <div className="space-y-1.5 opacity-40 grayscale pointer-events-none">
                            {PRO_FEATURES.map(feat => {
                                const Icon = iconMap[feat.icon] || Database;
                                return (
                                    <div key={feat.name} className="h-10 flex items-center gap-3 px-3 rounded-lg border border-transparent">
                                        <Icon className="w-4 h-4 text-[#94a3b8]" />
                                        <span className="text-[11px] font-bold text-[#94a3b8]">{feat.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto">
                <div className="mx-6 h-[1px] bg-[#2563eb]/20" />
                <div className="p-6">
                    <FreeTierBanner />
                </div>
            </div>
        </div>
    );
}
