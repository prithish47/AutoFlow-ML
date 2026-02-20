import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MetricsDashboard({ results }) {
    if (!results || Object.keys(results).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 opacity-30">
                <p className="label-caps">Metrics unavailable</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Execute the pipeline to see analysis.</p>
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
        { label: 'R² Score', value: metrics.r2_score },
        { label: 'RMSE', value: metrics.rmse },
        { label: 'MAE', value: metrics.mae },
        { label: 'Samples', value: metrics.test_samples },
    ].filter(m => m.value !== undefined);

    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-4">
                {metricCards.map((m, i) => (
                    <div key={i} className="bg-white/[0.02] rounded-lg border border-[var(--border-subtle)] p-3 shadow-sm">
                        <span className="label-caps !text-[9px] mb-2 block opacity-70">{m.label}</span>
                        <p className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                            {typeof m.value === 'number' ?
                                (m.value % 1 === 0 ? m.value : m.value.toFixed(4))
                                : m.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="flex gap-6 h-48">
                {/* Prediction Chart */}
                {chartData.predictions && chartData.predictions.length > 0 && (
                    <div className="flex-1 bg-white/[0.02] rounded-lg border border-[var(--border-subtle)] p-4 shadow-sm">
                        <h4 className="label-caps !text-[9px] mb-5">
                            Actual vs Predicted
                        </h4>
                        <div className="h-[calc(100%-32px)]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData.predictions.slice(0, 30)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="index" hide />
                                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '11px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ fontSize: '10px' }}
                                    />
                                    <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={1.5} dot={false} name="Actual" />
                                    <Line type="monotone" dataKey="predicted" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} dot={false} name="Predicted" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Feature Importance */}
                {chartData.feature_importance && chartData.feature_importance.length > 0 && (
                    <div className="flex-1 bg-white/[0.02] rounded-lg border border-[var(--border-subtle)] p-4 shadow-sm">
                        <h4 className="label-caps !text-[9px] mb-5">
                            Feature Importance
                        </h4>
                        <div className="h-[calc(100%-32px)]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.feature_importance.slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 9, fill: 'var(--text-secondary)', width: 60 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '11px' }}
                                    />
                                    <Bar dataKey="importance" fill="var(--accent)" radius={[0, 2, 2, 0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

