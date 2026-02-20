import { useCallback, useRef, useState, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    ControlButton,
    MiniMap,
    addEdge,
    useReactFlow,
    reconnectEdge,
    ConnectionLineType,
    MarkerType,
    SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePipeline } from '../context/PipelineContext';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import NodeContextMenu from './NodeContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import Onboarding from './Onboarding';
import { NODE_TYPES } from '../utils/nodeDefinitions';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { default: CustomEdge };

const connectionLineStyle = {
    stroke: '#18181b',
    strokeWidth: 2,
};

const defaultEdgeOptions = {
    type: 'default',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#d4d4d8',
    },
};

// Helper: check if edge already exists
function isDuplicateEdge(edges, source, target, sourceHandle, targetHandle) {
    return edges.some(
        (e) =>
            e.source === source &&
            e.target === target &&
            (e.sourceHandle ?? null) === (sourceHandle ?? null) &&
            (e.targetHandle ?? null) === (targetHandle ?? null)
    );
}

// Helper: generate stable edge id
function getEdgeId(source, target) {
    return `e-${source}-${target}-${Date.now()}`;
}

export default function PipelineCanvas() {
    const reactFlowWrapper = useRef(null);
    const reactFlowInstance = useReactFlow();

    const {
        nodes = [],
        setNodes,
        edges = [],
        setEdges,
        onNodesChange,
        onEdgesChange,
        setSelectedNodeId,
        executionState,
        isLocked,
        setIsLocked,
        copyToClipboard,
        pasteFromClipboard,
        duplicateNodes,
        deleteNodes,
        deleteEdges,
    } = usePipeline();

    const [isConnecting, setIsConnecting] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);

    // Connection validation: no self-connect, no duplicates
    const isValidConnection = useCallback(
        (connection) => {
            if (!connection?.source || !connection?.target) return false;
            if (connection.source === connection.target) return false;
            if (isLocked) return false;
            if (isDuplicateEdge(edges, connection.source, connection.target, connection.sourceHandle, connection.targetHandle)) {
                return false;
            }
            return true;
        },
        [edges, isLocked]
    );

    // onConnect with validation + auto-remove conflicting target handle edges
    const onConnect = useCallback(
        (params) => {
            if (!isValidConnection(params)) return;
            setEdges((eds) => {
                const filtered = eds.filter(
                    (e) => !(e.target === params.target && (e.targetHandle ?? null) === (params.targetHandle ?? null))
                );
                return addEdge(
                    { ...params, type: 'default', id: getEdgeId(params.source, params.target) },
                    filtered
                );
            });
        },
        [setEdges, isValidConnection]
    );

    const onEdgeUpdate = useCallback(
        (oldEdge, newConnection) => {
            if (!isValidConnection(newConnection)) return;
            setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
        },
        [setEdges, isValidConnection]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const nodeDef = NODE_TYPES[type];
            if (!nodeDef) return;

            const newNodeId = `${type}-${Date.now()}`;
            const newNode = {
                id: newNodeId,
                type: 'custom',
                position,
                data: {
                    label: nodeDef.label,
                    nodeType: type,
                    icon: nodeDef.icon,
                    category: nodeDef.category,
                    description: nodeDef.description,
                    inputs: nodeDef.inputs,
                    outputs: nodeDef.outputs,
                    config: Object.keys(nodeDef.config || {}).reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
                    status: 'idle',
                },
            };

            const currentEdges = reactFlowInstance.getEdges();
            const currentNodes = reactFlowInstance.getNodes();
            let edgeToSplit = null;

            for (const edge of currentEdges) {
                const source = currentNodes.find((n) => n.id === edge.source);
                const target = currentNodes.find((n) => n.id === edge.target);
                if (source && target) {
                    const midX = (source.position.x + target.position.x) / 2;
                    const midY = (source.position.y + target.position.y) / 2;
                    const d = Math.sqrt(Math.pow(position.x - midX, 2) + Math.pow(position.y - midY, 2));
                    if (d < 80) {
                        edgeToSplit = edge;
                        break;
                    }
                }
            }

            if (edgeToSplit) {
                const newEdges = [
                    { id: getEdgeId(edgeToSplit.source, newNodeId), source: edgeToSplit.source, target: newNodeId, type: 'default' },
                    { id: getEdgeId(newNodeId, edgeToSplit.target), source: newNodeId, target: edgeToSplit.target, type: 'default' },
                ];
                setEdges((eds) => eds.filter((e) => e.id !== edgeToSplit.id).concat(newEdges));
            }

            setNodes((nds) => [...nds, newNode]);
        },
        [reactFlowInstance, setNodes, setEdges]
    );

    const onEdgeDoubleClick = useCallback(
        (event, edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return;

            const position = {
                x: (sourceNode.position.x + targetNode.position.x) / 2,
                y: (sourceNode.position.y + targetNode.position.y) / 2,
            };

            const type = 'remove_nulls';
            const nodeDef = NODE_TYPES[type];
            const newNodeId = `${type}-${Date.now()}`;

            const newNode = {
                id: newNodeId,
                type: 'custom',
                position,
                data: {
                    label: nodeDef.label,
                    nodeType: type,
                    icon: nodeDef.icon,
                    category: nodeDef.category,
                    description: nodeDef.description,
                    inputs: nodeDef.inputs,
                    outputs: nodeDef.outputs,
                    config: {},
                    status: 'idle',
                },
            };

            const newEdges = [
                { id: getEdgeId(edge.source, newNodeId), source: edge.source, target: newNodeId, type: 'default' },
                { id: getEdgeId(newNodeId, edge.target), source: newNodeId, target: edge.target, type: 'default' },
            ];

            setNodes((nds) => nds.concat(newNode));
            setEdges((eds) => eds.filter((e) => e.id !== edge.id).concat(newEdges));
        },
        [nodes, setNodes, setEdges]
    );

    const onConnectStart = useCallback(() => setIsConnecting(true), []);
    const onConnectEnd = useCallback(() => setIsConnecting(false), []);

    const onNodeClick = useCallback(
        (_, node) => {
            setSelectedNodeId(node.id);
        },
        [setSelectedNodeId]
    );

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, [setSelectedNodeId]);

    const onEdgeClick = useCallback(
        (_, edge) => {
            setSelectedNodeId(null);
        },
        [setSelectedNodeId]
    );

    // Context menu: Delete Node
    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();
            if (isLocked) return;
            setContextMenu({ type: 'node', x: event.clientX, y: event.clientY, target: node });
        },
        [isLocked]
    );

    // Context menu: Delete Edge
    const onEdgeContextMenu = useCallback(
        (event, edge) => {
            event.preventDefault();
            if (isLocked) return;
            setContextMenu({ type: 'edge', x: event.clientX, y: event.clientY, target: edge });
        },
        [isLocked]
    );

    // Prevent delete during execution
    const onBeforeDelete = useCallback(
        ({ nodes: nodesToDelete, edges: edgesToDelete }) => {
            if (executionState === 'running') return false;
            return { nodes: nodesToDelete, edges: edgesToDelete };
        },
        [executionState]
    );

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        const container = reactFlowWrapper.current?.closest('.flex-1');
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen?.().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false));
        }
    }, []);

    useEffect(() => {
        const handler = () => {
            if (document.fullscreenElement) setIsFullscreen(true);
            else setIsFullscreen(false);
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Keyboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+D
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLocked) return;
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const mod = isMac ? e.metaKey : e.ctrlKey;
            if (!mod) return;

            if (e.key === 'c') {
                const selected = nodes.filter((n) => n.selected);
                if (selected.length) {
                    copyToClipboard(selected);
                }
            } else if (e.key === 'v') {
                pasteFromClipboard({ x: 30, y: 30 });
            } else if (e.key === 'd') {
                const selected = nodes.filter((n) => n.selected);
                if (selected.length) {
                    duplicateNodes(selected);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLocked, nodes, copyToClipboard, pasteFromClipboard, duplicateNodes]);

    // Style edges with execution context
    const styledEdges = edges.map((edge) => ({
        ...edge,
        animated: executionState === 'running',
    }));

    const [miniMapPos, setMiniMapPos] = useState({ x: 20, y: 20 });
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const mapRef = useRef(null);

    const onMapMouseDown = (e) => {
        e.stopPropagation();
        setIsDraggingMap(true);
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (isDraggingMap) {
                setMiniMapPos((prev) => ({
                    x: Math.max(0, window.innerWidth - e.clientX - 100),
                    y: Math.max(0, window.innerHeight - e.clientY - 80),
                }));
            }
        };
        const onMouseUp = () => setIsDraggingMap(false);

        if (isDraggingMap) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDraggingMap]);

    const interactive = !isLocked;

    return (
        <div className="flex-1 h-full relative overflow-hidden bg-[#fafafa]" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onEdgeClick={onEdgeClick}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onBeforeDelete={onBeforeDelete}
                isValidConnection={isValidConnection}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                nodesDraggable={interactive}
                nodesConnectable={interactive}
                elementsSelectable={interactive}
                edgesReconnectable={interactive}
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode="Shift"
                selectionMode={SelectionMode.Partial}
                selectionOnDrag
                fitView
                defaultViewport={{ x: 50, y: 50, zoom: 0.75 }}
                connectionLineStyle={connectionLineStyle}
                connectionLineType={ConnectionLineType.Bezier}
                defaultEdgeOptions={defaultEdgeOptions}
                snapToGrid
                snapGrid={[20, 20]}
                className={`transition-colors duration-500 ${isConnecting ? 'bg-zinc-50' : 'bg-[#fafafa]'}`}
            >
                <Background variant="lines" gap={40} size={1} color="#f4f4f5" />

                <Controls
                    showInteractive={true}
                    onInteractiveChange={(interactive) => setIsLocked(!interactive)}
                    className="!bg-white !border-zinc-200 !shadow-sm !rounded-md !m-4 !p-0.5 !flex !flex-row !gap-0"
                >
                    <ControlButton
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        )}
                    </ControlButton>
                </Controls>

                <div
                    ref={mapRef}
                    onMouseDown={onMapMouseDown}
                    style={{ position: 'absolute', bottom: miniMapPos.y, right: miniMapPos.x }}
                    className={`z-50 cursor-move transition-transform ${isDraggingMap ? 'scale-[1.02]' : ''}`}
                >
                    <MiniMap
                        nodeColor={(n) => `var(--cat-${n.data?.category}, #e4e4e7)`}
                        maskColor="rgba(255, 255, 255, 0.8)"
                        className="!bg-white !border-zinc-200 !rounded-lg !shadow-xl !m-0 !relative !bottom-0 !right-0"
                        style={{ width: 160, height: 100 }}
                    />
                </div>
            </ReactFlow>

            {nodes.length === 0 && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto">
                    <Onboarding />
                </div>
            )}

            {isConnecting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900 text-white text-[11px] font-bold rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 uppercase tracking-[0.2em]">
                    Connecting Nodes...
                </div>
            )}

            {contextMenu?.type === 'node' && (
                <NodeContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onDelete={() => contextMenu.target && deleteNodes([contextMenu.target.id])}
                    onClose={() => setContextMenu(null)}
                />
            )}
            {contextMenu?.type === 'edge' && (
                <EdgeContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onDelete={() => contextMenu.target && deleteEdges([contextMenu.target.id])}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
