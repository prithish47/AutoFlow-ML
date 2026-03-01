import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Loader2 } from 'lucide-react';
import { generateAPI } from '../utils/api';
import { usePipeline } from '../context/PipelineContext';
import { useReactFlow } from '@xyflow/react';

export default function GenerateModal({ isOpen, onClose }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const { setNodes, setEdges } = usePipeline();
    const { fitView } = useReactFlow();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const res = await generateAPI.generatePipeline(prompt.trim());
            const { nodes, edges } = res.data;

            // Optional: Animate node appearance via layout but react-flow handles it on render.
            // We just override the state
            setNodes(nodes);
            setEdges(edges);

            onClose();
            setPrompt('');

            // Fit view after small delay to let nodes render
            setTimeout(() => {
                fitView({ duration: 800, padding: 0.2 });
            }, 100);

        } catch (err) {
            console.error('Generation failed:', err);
            setError(err.response?.data?.error || 'Failed to generate pipeline. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isGenerating ? onClose : undefined}
                        className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden"
                        >
                            <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#f8fafc]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <Wand2 className="text-indigo-600" size={18} />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-[#0f172a]">Generate with AI</h3>
                                </div>
                                <button
                                    onClick={!isGenerating ? onClose : undefined}
                                    disabled={isGenerating}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:bg-black/5 hover:text-[#0f172a] transition-all disabled:opacity-50"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6">
                                <label className="block text-[13px] font-semibold text-[#64748b] mb-2">
                                    Describe your machine learning pipeline
                                </label>
                                <textarea
                                    autoFocus
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isGenerating}
                                    placeholder="e.g., Create a regression pipeline to predict house prices with preprocessing..."
                                    className="w-full h-32 p-3 bg-[#f8fafc] border border-black/10 rounded-xl text-[14px] text-[#0f172a] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none disabled:opacity-60"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleGenerate();
                                        }
                                    }}
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[12px] font-medium flex items-center justify-between"
                                    >
                                        <span>{error}</span>
                                        <button onClick={() => setError(null)} className="ml-2">
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-5 border-t border-black/5 bg-[#f8fafc] flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isGenerating}
                                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#64748b] hover:bg-black/5 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 size={16} />
                                            <span>Generate Pipeline</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
