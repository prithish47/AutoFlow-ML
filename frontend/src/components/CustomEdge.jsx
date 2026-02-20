import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

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
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: selected ? 3 : 2,
                    stroke: selected ? 'var(--accent)' : 'var(--edge)',
                    transition: 'stroke-width 0.2s, stroke 0.2s',
                    filter: selected ? 'drop-shadow(0 0 4px rgba(37, 99, 235, 0.3))' : 'none'
                }}
                className={`${animated ? 'edge-running' : ''} transition-all duration-300`}
            />
            {data?.showInsertLabel && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <button className="bg-white border border-zinc-200 shadow-premium rounded-full px-2 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 transition-all scale-0 group-hover:scale-100 origin-center">
                            + Insert
                        </button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
