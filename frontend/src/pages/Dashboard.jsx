import { ReactFlowProvider } from '@xyflow/react';
import { PipelineProvider } from '../context/PipelineContext';
import TopBar from '../components/TopBar';
import NodeSidebar from '../components/NodeSidebar';
import PipelineCanvas from '../components/PipelineCanvas';
import ConfigPanel from '../components/ConfigPanel';
import ExecutionPanel from '../components/ExecutionPanel';

export default function Dashboard() {
    return (
        <PipelineProvider>
            <ReactFlowProvider>
                <div className="h-screen w-screen flex flex-col bg-[var(--bg-app)] overflow-hidden">
                    {/* Top Bar - Fixed Height 56px */}
                    <TopBar />

                    {/* Main Layout Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Sidebar - Fixed 280px */}
                        <aside className="w-[280px] h-full flex flex-col flex-shrink-0 bg-[var(--bg-panel)] border-r border-[var(--border-subtle)]">
                            <NodeSidebar />
                        </aside>

                        {/* Center Area: Canvas + Bottom Panel */}
                        <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-canvas)]">
                            <div className="flex-1 relative">
                                <PipelineCanvas />
                            </div>

                            {/* Bottom Execution Panel - Collapsible/Resizable */}
                            <ExecutionPanel />
                        </main>

                        {/* Right Config Panel - Fixed 320px */}
                        <aside className="w-[320px] h-full flex flex-col flex-shrink-0 bg-[var(--bg-panel)] border-l border-[var(--border-subtle)]">
                            <ConfigPanel />
                        </aside>
                    </div>
                </div>
            </ReactFlowProvider>
        </PipelineProvider>
    );
}
