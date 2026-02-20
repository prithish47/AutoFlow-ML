import { usePipeline } from '../context/PipelineContext';
import { NODE_TYPES } from '../utils/nodeDefinitions';

export default function ConfigPanel() {
    const { nodes, setNodes, selectedNodeId, uploadFile } = usePipeline();
    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    if (!selectedNodeId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white h-full border-l border-zinc-100">
                <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0l-.54 2.21c-.07.3-.39.49-.68.42l-2.08-.51c-1.49-.37-2.6 1.1-1.63 2.19l1.64 1.76c.22.24.22.62 0 .86l-1.64 1.76c-.97 1.1.14 2.56 1.63 2.19l2.08-.51c.29-.07.61.12.68.42l.54 2.21c.38 1.56 2.6 1.56 2.98 0l.54-2.21c.07-.3.39-.49.68-.42l2.08.51c1.49.37 2.6-1.1 1.63-2.19l-1.64-1.76c-.22-.24-.22-.62 0-.86l1.64-1.76c.97-1.1-.14-2.56-1.63-2.19l-2.08.51c-.29.07-.61-.12-.68-.42l-.54-2.21z" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="text-[13px] font-semibold text-zinc-900 mb-2 uppercase tracking-wider">Properties</h3>
                <p className="text-[12px] text-zinc-400 font-medium max-w-[200px]">
                    Select a block to configure parameters.
                </p>
            </div>
        );
    }

    const nodeDef = NODE_TYPES[selectedNode.data.nodeType];

    const updateConfig = (key, value) => {
        setNodes(prev => prev.map(n =>
            n.id === selectedNodeId
                ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
                : n
        ));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const fileId = await uploadFile(file);
                updateConfig('fileId', fileId);
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden border-l border-zinc-200">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-xl border border-zinc-100">
                        {selectedNode.data.icon}
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest block mb-0.5">
                            {selectedNode.data.category}
                        </span>
                        <h2 className="text-[15px] font-semibold text-zinc-900 truncate">
                            {selectedNode.data.label}
                        </h2>
                    </div>
                </div>
                <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                    {selectedNode.data.description}
                </p>
            </div>

            {/* Config Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Configuration</h3>
                        <span className="text-[10px] font-mono text-zinc-300">ID: {selectedNode.id.split('-')[0]}</span>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(nodeDef.config || {}).map(([key, field]) => (
                            <div key={key} className="space-y-2">
                                <label className="text-[12px] font-medium text-zinc-700 block">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'string' && key === 'fileId' ? (
                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="w-full h-10 border border-dashed border-zinc-200 rounded-md bg-zinc-50 group-hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="text-[12px] font-medium text-zinc-500">
                                                    {selectedNode.data.config[key] ? 'Change Dataset' : 'Upload CSV'}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedNode.data.config[key] && (
                                            <div className="bg-zinc-900 px-3 py-2 rounded-md flex items-center justify-between">
                                                <p className="text-[11px] text-zinc-100 font-mono truncate">
                                                    {selectedNode.data.config[key]}
                                                </p>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                ) : field.type === 'select' ? (
                                    <select
                                        value={selectedNode.data.config[key] || ''}
                                        onChange={(e) => updateConfig(key, e.target.value)}
                                        className="w-full h-9 rounded-md bg-white border border-zinc-200 focus:outline-none focus:border-zinc-400 px-3 text-[13px] font-medium text-zinc-900"
                                    >
                                        <option value="" disabled>Select option</option>
                                        {(field.options || []).map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type === 'number' ? 'number' : 'text'}
                                        value={selectedNode.data.config[key] || ''}
                                        onChange={(e) => updateConfig(key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                        className="w-full h-9 rounded-md bg-white border border-zinc-200 focus:outline-none focus:border-zinc-400 px-3 text-[13px] font-medium text-zinc-900 placeholder:text-zinc-300"
                                        placeholder="Value..."
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {(!nodeDef.config || Object.keys(nodeDef.config).length === 0) && (
                        <div className="py-8 text-center border border-dashed border-zinc-100 rounded-lg">
                            <p className="text-[11px] text-zinc-400">Fixed parameters</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-50">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Technical Schema</span>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-zinc-50 rounded-md border border-zinc-100 space-y-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Input</span>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedNode.data.inputs.length > 0 ? selectedNode.data.inputs.map(i => (
                                    <div key={i} className="bg-white px-2 py-0.5 rounded border border-zinc-100 text-[10px] font-medium text-blue-600">{i}</div>
                                )) : <span className="text-[10px] text-zinc-300 italic">None</span>}
                            </div>
                        </div>
                        <div className="p-3 bg-zinc-50 rounded-md border border-zinc-100 space-y-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Output</span>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedNode.data.outputs.length > 0 ? selectedNode.data.outputs.map(o => (
                                    <div key={o} className="bg-white px-2 py-0.5 rounded border border-zinc-100 text-[10px] font-medium text-emerald-600">{o}</div>
                                )) : <span className="text-[10px] text-zinc-300 italic">None</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/20 flex items-center justify-between">
                <span className="text-[10px] font-medium text-zinc-400 uppercase">Instance: {selectedNode.id.split('-')[0]}</span>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedNode.data.status === 'success' ? 'bg-emerald-500' :
                        selectedNode.data.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            selectedNode.data.status === 'failed' ? 'bg-red-500' : 'bg-zinc-300'
                        }`} />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {selectedNode.data.status || 'Ready'}
                    </span>
                </div>
            </div>
        </div>

    );
}

