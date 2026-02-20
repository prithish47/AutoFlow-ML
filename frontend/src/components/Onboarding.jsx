import { usePipeline } from '../context/PipelineContext';

export default function Onboarding() {
    const { setNodes, setEdges } = usePipeline();

    const loadExamplePipeline = () => {
        const exampleNodes = [
            {
                id: 'csv_upload-example-1',
                type: 'custom',
                position: { x: 50, y: 150 },
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
                position: { x: 300, y: 150 },
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
                position: { x: 550, y: 150 },
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
                position: { x: 800, y: 100 },
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
                position: { x: 1050, y: 150 },
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
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-zinc-50/80 backdrop-blur-md">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-xl p-12 max-w-[480px] w-full text-center">

                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-[24px] font-semibold text-zinc-900 mb-2 tracking-tight">
                    Welcome to FlowML
                </h1>
                <p className="text-[14px] text-zinc-500 mb-10 leading-relaxed font-medium">
                    A visual environment for designing and executing professional machine learning workflows.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    {[
                        { title: 'Templates', text: 'Pre-defined flows', icon: '⚡' },
                        { title: 'Engine', text: 'High-performance', icon: '⚙️' },
                    ].map((step, i) => (
                        <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 text-left">
                            <div className="text-lg mb-2">{step.icon}</div>
                            <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-0.5">{step.title}</h4>
                            <p className="text-[10px] font-medium text-zinc-400">{step.text}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={loadExamplePipeline}
                        className="w-full h-11 text-[13px] font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-all flex items-center justify-center gap-2"
                    >
                        Instantiate Starter Flow
                    </button>

                    <button
                        onClick={() => setNodes([])}
                        className="w-full h-11 text-[13px] font-semibold text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                    >
                        Start Blank Project
                    </button>
                </div>
            </div>
        </div>
    );
}
