import { useState } from 'react';
import { Brain, Loader2, Sparkles, MessageCircle, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';
import { usePipeline } from '../context/PipelineContext';
import { explainAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExplanationPanel() {
    const { nodes, edges, setSelectedNodeId } = usePipeline();

    const [explanation, setExplanation] = useState(null);
    const [compactPipeline, setCompactPipeline] = useState(null);
    const [isLoadingExplain, setIsLoadingExplain] = useState(false);
    const [explainError, setExplainError] = useState('');

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [isLoadingQA, setIsLoadingQA] = useState(false);
    const [qaError, setQaError] = useState('');

    const handleExplain = async () => {
        if (nodes.length === 0) {
            setExplainError('Pipeline is empty. Add nodes to explain.');
            return;
        }

        setIsLoadingExplain(true);
        setExplainError('');
        setExplanation(null);
        setAnswer(null);

        try {
            const res = await explainAPI.explainPipeline(nodes, edges);
            setExplanation(res.data.explanation);
            setCompactPipeline(res.data.compactPipeline);
        } catch (err) {
            setExplainError(err.response?.data?.error || err.message || 'Failed to explain pipeline.');
        } finally {
            setIsLoadingExplain(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim() || !explanation) return;
        if (question.length > 200) {
            setQaError('Question too long (max 200 chars).');
            return;
        }

        setIsLoadingQA(true);
        setQaError('');
        setAnswer(null);

        try {
            const res = await explainAPI.askQuestion(question.trim(), explanation, compactPipeline);
            setAnswer(res.data.answer);
            setQuestion('');
        } catch (err) {
            setQaError(err.response?.data?.error || err.message || 'Failed to answer question.');
        } finally {
            setIsLoadingQA(false);
        }
    };

    const handleStepHover = (stepName) => {
        if (!nodes) return;
        // Try to find a node that somewhat matches the step name
        const match = nodes.find(n =>
            n.data?.label?.toLowerCase().includes(stepName.toLowerCase()) ||
            stepName.toLowerCase().includes(n.data?.label?.toLowerCase())
        );
        if (match) setSelectedNodeId(match.id);
    };

    const handleStepLeave = () => {
        setSelectedNodeId(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] text-[#0f172a] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-black/5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Brain className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-[#0f172a] tracking-tight">AI Pipeline Tutor</h2>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Powered by Gemini</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
                {!explanation && !isLoadingExplain && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-12">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center shadow-inner">
                            <Sparkles size={28} className="text-indigo-400" />
                        </div>
                        <div className="space-y-1 max-w-[220px]">
                            <h3 className="text-[14px] font-bold text-[#334155]">Explain Pipeline</h3>
                            <p className="text-[12px] text-[#64748b] leading-relaxed">
                                Get a structured breakdown of your ML workflow and ask questions.
                            </p>
                        </div>
                        <button
                            onClick={handleExplain}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold tracking-wide rounded-lg shadow-md transition-all active:scale-95"
                        >
                            Generate Explanation
                        </button>
                        {explainError && (
                            <p className="text-[11px] text-red-500 font-bold mt-2 bg-red-50 p-2 rounded">{explainError}</p>
                        )}
                    </div>
                )}

                {isLoadingExplain && (
                    <div className="flex flex-col items-center justify-center h-full text-center pt-16">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <p className="text-[12px] font-bold text-indigo-900 uppercase tracking-widest animate-pulse">Analyzing Workflow...</p>
                    </div>
                )}

                {explanation && !isLoadingExplain && (
                    <div className="space-y-8 pb-10">
                        {/* Summary */}
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest border-b border-black/5 pb-2">Overview</h3>
                            <p className="text-[13px] text-[#334155] leading-relaxed bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                                {explanation.summary}
                            </p>
                        </div>

                        {/* Steps */}
                        {explanation.steps && explanation.steps.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest border-b border-black/5 pb-2">Step-by-Step Breakdown</h3>
                                <div className="space-y-3">
                                    {explanation.steps.map((step, idx) => (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => handleStepHover(step.name)}
                                            onMouseLeave={handleStepLeave}
                                            className="group flex gap-3 p-3 bg-white border border-black/5 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-default"
                                        >
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 mt-0.5">
                                                <span className="text-[10px] font-black text-indigo-600">{idx + 1}</span>
                                            </div>
                                            <div className="space-y-1 text-left flex-1 min-w-0">
                                                <h4 className="text-[13px] font-bold text-[#0f172a] truncate">{step.name}</h4>
                                                <p className="text-[11px] text-[#475569] leading-relaxed"><span className="font-semibold">Purpose:</span> {step.purpose}</p>
                                                <p className="text-[11px] text-[#64748b] leading-relaxed mt-1 italic">&ldquo;{step.why_needed}&rdquo;</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Best Practices */}
                        {explanation.best_practices && explanation.best_practices.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2 flex items-center gap-1.5 ">
                                    <Lightbulb size={12} /> Best Practices
                                </h3>
                                <ul className="space-y-2 pl-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                    {explanation.best_practices.map((bp, i) => (
                                        <li key={i} className="text-[12px] text-[#334155] flex items-start gap-2">
                                            <ChevronRight size={14} className="text-emerald-500 shrink-0 mt-[1px]" />
                                            <span className="leading-snug">{bp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warnings */}
                        {explanation.warnings && explanation.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2 flex items-center gap-1.5">
                                    <AlertTriangle size={12} /> Watch Out For
                                </h3>
                                <ul className="space-y-2 pl-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                                    {explanation.warnings.map((warn, i) => (
                                        <li key={i} className="text-[12px] text-[#334155] flex items-start gap-2">
                                            <ChevronRight size={14} className="text-amber-500 shrink-0 mt-[1px]" />
                                            <span className="leading-snug">{warn}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Refresh Button */}
                        <div className="pt-2 text-center border-t border-black/5">
                            <button
                                onClick={handleExplain}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 tracking-wider uppercase"
                            >
                                Refresh Explanation
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Q&A Section Boxed at Bottom */}
            {explanation && (
                <div className="p-4 bg-white border-t border-black/5 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10 shrink-0">
                    <form onSubmit={handleAskQuestion} className="relative">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={isLoadingQA}
                            placeholder="Ask a question about this pipeline..."
                            className="w-full h-11 pl-4 pr-12 text-[12px] font-medium bg-[#f8fafc] border border-black/10 rounded-lg focus:outline-none focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-50"
                            maxLength={200}
                        />
                        <button
                            type="submit"
                            disabled={isLoadingQA || !question.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-[#cbd5e1] transition-all"
                        >
                            {isLoadingQA ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />}
                        </button>
                    </form>

                    {qaError && (
                        <p className="text-[10px] font-bold text-red-500 mt-2 ml-1">{qaError}</p>
                    )}

                    <AnimatePresence>
                        {answer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                            >
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg relative">
                                    <div className="absolute top-3 left-3 w-1 h-full bg-indigo-400 rounded-full" style={{ height: 'calc(100% - 24px)' }} />
                                    <p className="text-[12px] text-[#334155] leading-relaxed pl-3 italic font-medium">
                                        {answer}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
