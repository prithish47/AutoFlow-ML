import { usePipeline } from '../context/PipelineContext';
import { Zap, Layout, FileCode, PlayCircle } from 'lucide-react';

export default function Onboarding() {
    const { setNodes, setEdges, setHasDismissedOnboarding } = usePipeline();

    const loadExamplePipeline = () => {
        const exampleNodes = [
            {
                id: 'csv_upload-example-1',
                type: 'custom',
                position: { x: 50, y: 100 },
                data: {
                    label: 'CSV Upload',
                    nodeType: 'csv_upload',
                    icon: '📄',
                    category: 'input',
                    description: 'Upload a CSV dataset file',
                    inputs: [],
                    outputs: ['dataframe'],
                    config: { fileId: '' },
                    status: 'idle'
                }
            },
            {
                id: 'remove_nulls-example-2',
                type: 'custom',
                position: { x: 450, y: 100 },
                data: {
                    label: 'Data Cleaning',
                    nodeType: 'remove_nulls',
                    icon: '🧹',
                    category: 'prep',
                    description: 'Handle missing values in data',
                    inputs: ['dataframe'],
                    outputs: ['dataframe'],
                    config: { strategy: 'drop_rows' },
                    status: 'idle'
                }
            },
            {
                id: 'train_test_split-example-3',
                type: 'custom',
                position: { x: 750, y: 350 },
                data: {
                    label: 'Train/Test Split',
                    nodeType: 'train_test_split',
                    icon: '✂️',
                    category: 'prep',
                    description: 'Split data into training and test sets',
                    inputs: ['dataframe'],
                    outputs: ['train_data', 'test_data'],
                    config: { test_size: 0.2, target_column: 'sepal_length', random_state: 42 },
                    status: 'idle'
                }
            },
            {
                id: 'linear_regression-example-4',
                type: 'custom',
                position: { x: 1150, y: 100 },
                data: {
                    label: 'Linear Regression',
                    nodeType: 'linear_regression',
                    icon: '📈',
                    category: 'model',
                    description: 'Fit a linear regression model',
                    inputs: ['train_data'],
                    outputs: ['model'],
                    config: {},
                    status: 'idle'
                }
            },
            {
                id: 'accuracy-example-5',
                type: 'custom',
                position: { x: 1550, y: 350 },
                data: {
                    label: 'Model Evaluation',
                    nodeType: 'accuracy',
                    icon: '🎯',
                    category: 'eval',
                    description: 'Evaluate model performance',
                    inputs: ['model', 'test_data'],
                    outputs: ['metrics'],
                    config: {},
                    status: 'idle'
                }
            }
        ];

        const exampleEdges = [
            { id: 'e-1-2', source: 'csv_upload-example-1', target: 'remove_nulls-example-2', type: 'smoothstep' },
            { id: 'e-2-3', source: 'remove_nulls-example-2', target: 'train_test_split-example-3', type: 'smoothstep' },
            { id: 'e-3-4', source: 'train_test_split-example-3', target: 'linear_regression-example-4', type: 'smoothstep' },
            { id: 'e-3-5', source: 'train_test_split-example-3', target: 'accuracy-example-5', type: 'smoothstep' },
            { id: 'e-4-5', source: 'linear_regression-example-4', target: 'accuracy-example-5', type: 'smoothstep' },
        ];

        setNodes(exampleNodes);
        setEdges(exampleEdges);
        setHasDismissedOnboarding(true);
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[4px]">
            <div className="bg-[#ffffff] border border-black/5 rounded-[24px] shadow-2xl p-8 max-w-[360px] w-full text-center">

                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center text-[#2563eb]">
                        <Zap size={28} strokeWidth={2.5} className="drop-shadow-sm" />
                    </div>
                </div>

                <h1 className="text-[20px] font-bold text-[#0f172a] mb-2 tracking-tight">
                    Welcome to FlowML
                </h1>
                <p className="text-[12px] text-[#64748b] mb-8 leading-relaxed font-medium px-4">
                    Enterprise environment for designing professional ML workflows.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                    <div className="p-3 rounded-xl border border-black/5 bg-[#f8fafc]">
                        <Layout className="w-4 h-4 text-[#2563eb] mb-2" />
                        <h4 className="text-[9px] font-black text-[#0f172a] uppercase tracking-wider mb-1">Canvas</h4>
                        <p className="text-[9px] text-[#64748b] leading-tight font-medium">Build your DAG.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-black/5 bg-[#f8fafc]">
                        <PlayCircle className="w-4 h-4 text-[#16a34a] mb-2" />
                        <h4 className="text-[9px] font-black text-[#0f172a] uppercase tracking-wider mb-1">Engine</h4>
                        <p className="text-[9px] text-[#64748b] leading-tight font-medium">Live execution.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={loadExamplePipeline}
                        className="w-full h-10 text-[12px] font-bold rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2563eb]/20"
                    >
                        Load Starter Pipeline
                    </button>

                    <button
                        onClick={() => {
                            setNodes([]);
                            setHasDismissedOnboarding(true);
                        }}
                        className="w-full h-10 text-[12px] font-bold text-[#64748b] hover:bg-[#f8fafc] rounded-xl transition-all border border-transparent hover:border-black/5"
                    >
                        Create Blank Project
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-center gap-3 text-[10px] text-[#94a3b8] font-bold uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-1.5"><FileCode size={11} /> 2.0.1</div>
                    <div className="w-1 h-1 rounded-full bg-black/5"></div>
                    <div>Cloud Sync</div>
                </div>
            </div>
        </div>
    );
}
