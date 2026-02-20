import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export default function MetricsDashboard({ results }) {
    if (!results || Object.keys(results).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 opacity-40">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#94a3b8]">Metrics Pending</p>
                <p className="text-[10px] text-[#64748b] mt-2 italic font-bold">Awaiting pipeline execution for data insight extraction.</p>
            </div>
        );
    }

    // Extract metrics and chart data
    let metrics = {};
    let chartData = { predictions: [], feature_importance: [] };

    Object.entries(results).forEach(([key, value]) => {
        if (key.includes('chart')) {
            chartData = { ...chartData, ...value };
        } else if (value && typeof value === 'object') {
            metrics = { ...metrics, ...value };
        }
    });

    const metricCards = [
        { label: 'R² Core Accuracy', value: metrics.r2_score, color: '#2563eb' },
        { label: 'RMS Error (RMSE)', value: metrics.rmse, color: '#0891b2' },
        { label: 'Mean Absolute Err', value: metrics.mae, color: '#ca8a04' },
        { label: 'Evaluation Samples', value: metrics.test_samples, color: '#16a34a' },
    ].filter(m => m.value !== undefined);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-6">
                {metricCards.map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-[#ffffff] rounded-2xl border border-black/5 p-5 relative overflow-hidden flex flex-col justify-between group hover:border-[#2563eb]/20 transition-all shadow-sm"
                    >
                        <div className="absolute top-0 left-0 w-full h-[2px] opacity-20 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: m.color }} />
                        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest block mb-1">{m.label}</span>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-[#0f172a] tabular-nums tracking-tight">
                                {typeof m.value === 'number' ?
                                    (m.value % 1 === 0 ? m.value : m.value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }))
                                    : m.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-8 h-72">
                {/* Prediction Chart */}
                {chartData.predictions && chartData.predictions.length > 0 && (
                    <div className="bg-[#ffffff] rounded-2xl border border-black/5 p-6 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[11px] font-bold text-[#475569] uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                                Residual Projection Analysis
                            </h4>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#2563eb]">
                                    <div className="w-2 h-0.5 bg-[#2563eb]" /> ACTUAL
                                </span>
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#94a3b8]">
                                    <div className="w-2 h-0.5 border-t border-dashed border-[#cbd5e1]" /> PREDICTED
                                </span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.predictions.slice(0, 30)}>
                                    <defs>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.02)" vertical={false} />
                                    <XAxis dataKey="index" hide />
                                    <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 700, padding: 0 }}
                                    />
                                    <Area type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" name="Actual" dot={false} />
                                    <Line type="monotone" dataKey="predicted" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Predicted" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Feature Importance */}
                {chartData.feature_importance && chartData.feature_importance.length > 0 && (
                    <div className="bg-[#ffffff] rounded-2xl border border-black/5 p-6 shadow-xl flex flex-col">
                        <h4 className="text-[11px] font-bold text-[#475569] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
                            Feature Influence Weights
                        </h4>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.feature_importance.slice(0, 5)} layout="vertical" margin={{ left: -20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.02)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700, width: 90 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', fontSize: '11px' }}
                                    />
                                    <Bar dataKey="importance" fill="#0891b2" radius={[0, 4, 4, 0]} barSize={12}>
                                        {chartData.feature_importance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#0891b2'} opacity={1 - (index * 0.15)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
