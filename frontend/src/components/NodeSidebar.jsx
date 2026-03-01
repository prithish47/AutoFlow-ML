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

    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';

        // Create a custom small drag ghost image so the drag preview isn't huge
        const dragImage = document.createElement('div');
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.padding = '8px 16px';
        dragImage.style.backgroundColor = '#ffffff';
        dragImage.style.border = '1px solid #cbd5e1';
        dragImage.style.borderRadius = '6px';
        dragImage.style.fontSize = '12px';
        dragImage.style.fontWeight = 'bold';
        dragImage.style.color = '#334155';
        dragImage.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        dragImage.style.zIndex = '9999';
        dragImage.innerText = label;

        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 10, 10);

        // Remove the element after the drag snapshot is taken
        setTimeout(() => {
            if (document.body.contains(dragImage)) {
                document.body.removeChild(dragImage);
            }
        }, 0);
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] transition-colors group-focus-within:text-[#2563eb]" />
                    <input
                        type="text"
                        placeholder="Search operations..."
                        className="w-full pl-12 pr-4 h-12 rounded-xl bg-[#f8fafc] border border-[1.5px] border-[#e2e8f0] focus:outline-none focus:border-[#2563eb]/60 focus:bg-white transition-all text-[14.5px] font-bold text-[#0f172a] placeholder:text-[#94a3b8] placeholder:font-semibold"
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
                            <div key={category.id} className="space-y-4 mb-2">
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                                        <span className="text-[11.5px] font-extrabold text-[#475569] uppercase tracking-wider">
                                            {category.label}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-[#94a3b8] transition-transform duration-300 ${expandedCategories[category.id] ? 'rotate-0' : '-rotate-90'}`}
                                    />
                                </button>

                                {expandedCategories[category.id] && (
                                    <div className="grid grid-cols-1 gap-3 mt-2">
                                        {category.nodes.length > 0 ? (
                                            category.nodes.map(node => (
                                                <div
                                                    key={node.id}
                                                    draggable
                                                    onDragStart={(e) => onDragStart(e, node.id, node.label)}
                                                    className="p-2.5 flex items-center gap-3 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:shadow hover:border-[#2563eb]/40 cursor-grab active:cursor-grabbing transition-all group"
                                                >
                                                    <div className="w-8 h-8 shrink-0 rounded-md bg-[#f8fafc] border border-black/5 flex items-center justify-center group-hover:bg-[#2563eb]/10 group-hover:border-[#2563eb]/30 transition-all">
                                                        <Icon className="w-4 h-4 text-[#64748b] group-hover:text-[#2563eb] transition-colors" strokeWidth={2} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[13px] font-bold text-[#334155] group-hover:text-[#0f172a] truncate">
                                                            {node.label}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-[#94a3b8] truncate mt-0.5">
                                                            {node.id.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : searchTerm && (
                                            <div className="py-6 text-center border-2 border-dashed border-[#e2e8f0] rounded-xl bg-[#f8fafc]">
                                                <p className="text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider">NO BLOCKS FOUND</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pro Extensions */}
                    <div className="pt-8 border-t border-black/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[11.5px] font-extrabold text-[#64748b] uppercase tracking-wider">PRO Extensions</h3>
                            <span className="text-[9px] font-black tracking-wider text-[#2563eb] px-1.5 py-0.5 rounded mr-1 bg-[#2563eb]/10 border border-[#2563eb]/20">ENTERPRISE</span>
                        </div>
                        <div className="space-y-3 opacity-60 pointer-events-none">
                            {PRO_FEATURES.map(feat => {
                                const Icon = iconMap[feat.icon] || Database;
                                return (
                                    <div key={feat.name} className="p-2.5 flex items-center gap-3 rounded-lg bg-[#f8fafc] border border-dashed border-[#cbd5e1]">
                                        <div className="w-8 h-8 shrink-0 rounded-md bg-white border border-[#cbd5e1] flex items-center justify-center">
                                            <Icon className="w-4 h-4 text-[#94a3b8]" strokeWidth={2} />
                                        </div>
                                        <span className="text-[13px] font-bold text-[#64748b]">{feat.name}</span>
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
