import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { Plus, X } from 'lucide-react';
import { usePipeline } from '../context/PipelineContext';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
    animated,
    data
}) {
    const { deleteEdges } = usePipeline();
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            {/* Invisible wider path for better interaction */}
            <path
                d={edgePath}
                fill="none"
                strokeOpacity={0}
                strokeWidth={20}
                className="react-flow__edge-interaction cursor-pointer"
            />

            {/* Background Path (Glow effect) */}
            {selected && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={6}
                    strokeOpacity={0.15}
                    className="blur-md pointer-events-none"
                />
            )}

            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: selected ? 6 : 4,
                    stroke: selected ? '#0369a1' : '#0ea5e9',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`${animated ? 'edge-running' : ''} transition-all custom-edge-path`}
            />

            {(selected || data?.showInsertLabel) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan flex gap-2"
                    >
                        {data?.showInsertLabel && (
                            <button className="bg-white border border-black/10 shadow-lg rounded-full p-2 text-[#94a3b8] hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all hover:scale-110 active:scale-95 group">
                                <Plus size={12} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        )}
                        {selected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEdges([id]);
                                }}
                                className="bg-white border border-red-100 shadow-xl rounded-full p-2 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all hover:scale-110 active:scale-95 group"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
