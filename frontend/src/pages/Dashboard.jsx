import { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { PipelineProvider, usePipeline } from '../context/PipelineContext';
import TopBar from '../components/TopBar';
import NodeSidebar from '../components/NodeSidebar';
import PipelineCanvas from '../components/PipelineCanvas';
import RightSidebar from '../components/RightSidebar';
import ExecutionPanel from '../components/ExecutionPanel';
import Onboarding from '../components/Onboarding';

function DashboardContent() {
    const { nodes, hasDismissedOnboarding } = usePipeline();
    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(340);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);

    const startResizingLeft = useCallback((e) => {
        e.preventDefault();
        setIsResizingLeft(true);
    }, []);

    const startResizingRight = useCallback((e) => {
        e.preventDefault();
        setIsResizingRight(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizingLeft(false);
        setIsResizingRight(false);
    }, []);

    const resize = useCallback((e) => {
        if (isResizingLeft) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 450) {
                setLeftWidth(newWidth);
            }
        } else if (isResizingRight) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 200 && newWidth < 500) {
                setRightWidth(newWidth);
            }
        }
    }, [isResizingLeft, isResizingRight]);

    useEffect(() => {
        if (isResizingLeft || isResizingRight) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizingLeft, isResizingRight, resize, stopResizing]);

    return (
        <div className="h-screen w-screen flex flex-col bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans relative">
            <TopBar />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar Library */}
                <aside
                    style={{ width: leftWidth }}
                    className="h-full flex flex-col flex-shrink-0 bg-white border-r border-black/5 z-30 transition-[width] duration-0"
                >
                    <NodeSidebar />
                </aside>

                {/* Left Resize Handle */}
                <div
                    onMouseDown={startResizingLeft}
                    className={`absolute left-[${leftWidth}px] top-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-[#2563eb]/20 transition-colors ${isResizingLeft ? 'bg-[#2563eb]/30' : ''}`}
                    style={{ left: leftWidth - 3 }}
                />

                {/* Infinite Canvas */}
                <main className="flex-1 flex flex-col relative overflow-hidden bg-[#f1f5f9]">
                    <div className="flex-1 relative">
                        <PipelineCanvas />
                    </div>

                    {/* Collapsible Console */}
                    <div className="z-40">
                        <ExecutionPanel />
                    </div>
                </main>

                {/* Right Resize Handle */}
                <div
                    onMouseDown={startResizingRight}
                    className={`absolute right-[${rightWidth}px] top-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-[#2563eb]/20 transition-colors ${isResizingRight ? 'bg-[#2563eb]/30' : ''}`}
                    style={{ right: rightWidth - 3 }}
                />

                {/* Interactive Config Panel */}
                <aside
                    style={{ width: rightWidth }}
                    className="h-full flex flex-col flex-shrink-0 bg-white border-l border-black/5 z-30 overflow-y-auto custom-scrollbar transition-[width] duration-0"
                >
                    <RightSidebar />
                </aside>
            </div>

            {/* Global Overlay Onboarding */}
            {nodes && nodes.length === 0 && !hasDismissedOnboarding && (
                <div className="absolute inset-0 z-[60] pointer-events-auto">
                    <Onboarding />
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    return (
        <PipelineProvider>
            <ReactFlowProvider>
                <DashboardContent />
            </ReactFlowProvider>
        </PipelineProvider>
    );
}
