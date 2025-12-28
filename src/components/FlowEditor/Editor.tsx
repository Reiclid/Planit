'use client';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Circle, Transformer, Group } from 'react-konva';
import { useStore } from '@/store/useStore';
import { calculateEraser, calculateSelection } from '@/utils/canvasHelpers';

const Editor = () => {
    const { tool, lines, setLines, selectedIds, setSelectedIds } = useStore();
    const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0, isVisible: false });
    const isDrawing = useRef(false);

    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const trRef = useRef<any>(null);

    const handleErase = (stage: any) => {
        const pos = stage.getRelativePointerPosition();
        const { nextLines, wasModified } = calculateEraser(lines, pos);
        if (wasModified) setLines(nextLines);
    };

    // Drawing functions for pen and eraser
    const startDrawing = (stage: any) => {
        isDrawing.current = true;
        const pos = stage.getRelativePointerPosition();

        const newLine = {
            id: Date.now().toString(),
            tool,
            points: [[pos.x, pos.y]]
        };

        setLines([...lines, newLine]);
    };

    const continueDrawing = (stage: any) => {
        if (!isDrawing.current) return;
        const point = stage.getRelativePointerPosition();

        const newLines = [...lines];
        const lastLine = { ...newLines[newLines.length - 1] };

        if (!lastLine || !lastLine.points) return;

        const segments = [...lastLine.points];
        const lastSegment = [...segments[segments.length - 1]];

        lastSegment.push(point.x, point.y);

        lastLine.points = lastLine.points.concat([point.x, point.y]);

        segments[segments.length - 1] = lastSegment;
        lastLine.points = segments;

        newLines[newLines.length - 1] = lastLine;
        setLines(newLines);
    };

    // Selection functions for cursor tool
    const startSelecting = (stage: any) => {
        const pos = stage.getRelativePointerPosition();
        setSelectedIds([]);
        setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0, isVisible: true });
    };

    const updateSelectionBox = (stage: any) => {
        if (!selectionRect.isVisible) return;

        const pos = stage.getRelativePointerPosition();

        setSelectionRect((prev) => ({
            ...prev,
            width: pos.x - prev.x,
            height: pos.y - prev.y,
        }));
    }

    const stopSelecting = () => {
        if (!selectionRect.isVisible) return;
        const foundIds = calculateSelection(lines, selectionRect);
        setSelectedIds(foundIds);
        setSelectionRect({ ...selectionRect, isVisible: false });
    };

    const handleTransformEnd = (e: any, lineId: string) => {
        const node = e.target;

        const newAttrs = {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
        };

        setLines(lines.map((l) => {
            if (l.id === lineId) {
                return { ...l, ...newAttrs };
            }
            return l;
        }));
    };

    const updatePosition = (e: any, lineId: string) => {
        const newX = e.target.x();
        const newY = e.target.y();

        setLines(lines.map((l) => {
            if (l.id === lineId) {
                return { ...l, x: newX, y: newY };
            }
            return l;
        }));
    };

    const handleMouseDown = (e: any) => {
        const button = e.evt.button;

        if (button === 1 || button === 2) {
            isPanning.current = true;
            lastMousePos.current = { x: e.evt.clientX, y: e.evt.clientY };

            const container = e.target.getStage().container();
            container.style.cursor = 'grabbing';
            return;
        }

        if (button === 0) {
            const stage = e.target.getStage();
            if (tool === 'pen') startDrawing(stage);
            else if (tool === 'eraser') {
                isDrawing.current = true;
                handleErase(stage);
            }
            else if (tool === 'cursor') {
                if (e.target === stage) {
                    startSelecting(stage);
                }
            }
        }
    };

    const handleMouseMove = (e: any) => {
        const stage = e.target.getStage();

        if (isPanning.current) {
            const dx = e.evt.clientX - lastMousePos.current.x;
            const dy = e.evt.clientY - lastMousePos.current.y;

            lastMousePos.current = { x: e.evt.clientX, y: e.evt.clientY };

            stage.position({
                x: stage.x() + dx,
                y: stage.y() + dy,
            });
            stage.batchDraw();
            return;
        }

        if (tool === 'pen') continueDrawing(stage);
        else if (tool === 'eraser') {
            if (isDrawing.current) handleErase(stage);
        }
        else if (tool === 'cursor') updateSelectionBox(stage);
    };

    const handleMouseUp = (e: any) => {
        isPanning.current = false;
        isDrawing.current = false;

        const container = e.target.getStage().container();
        container.style.cursor = 'default';

        stopSelecting();
    };



    useEffect(() => {
        if (trRef.current && trRef.current.getLayer()) {
            const stage = trRef.current.getStage();

            const selectedNodes = selectedIds.map((id) => stage.findOne('#' + id)).filter(Boolean);

            trRef.current.nodes(selectedNodes);
            trRef.current.getLayer().batchDraw();
        }
    }, [selectedIds, lines]);

    return (
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}

            draggable={false}

            onContextMenu={(e) => e.evt.preventDefault()}

            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Layer>
                {lines.map((line, i) => (
                    <Group
                        key={line.id}
                        id={line.id}
                        draggable={tool === 'cursor'}
                        dragButtons={[0]}

                        x={line.x || 0}
                        y={line.y || 0}

                        onDragEnd={(e) => updatePosition(e, line.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, line.id)}
                    >
                        {/* Рендеримо кожен шматочок окремо */}
                        {line.points.map((segment: number[], index: number) => (
                            <Line
                                key={index}
                                points={segment}
                                stroke="#000000ff"
                                strokeWidth={5}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                            />
                        ))}
                    </Group>
                ))}

                {/* Приклад фігури (майбутній блок схеми) */}
                <Rect
                    x={200}
                    y={200}
                    width={100}
                    height={100}
                    fill="white"
                    stroke="black"
                    shadowBlur={10}
                    draggable={tool === 'cursor'}
                />

                {selectionRect.isVisible && (
                    <Rect
                        x={selectionRect.x}
                        y={selectionRect.y}
                        width={selectionRect.width}
                        height={selectionRect.height}
                        fill="rgba(0, 161, 255, 0.3)"
                        stroke="#00a1ff"
                    />
                )}

                <Transformer ref={trRef} />
            </Layer>
        </Stage>
    );
};

export default Editor;