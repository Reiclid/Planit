'use client';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Circle, Transformer, Group } from 'react-konva';
import { useStore } from '@/store/useStore';
import { calculateEraser, calculateSelection } from '@/utils/canvasHelpers';

const Editor = () => {
    const { tool, lines, setLines, selectedIds, setSelectedIds, penSetting } = useStore();

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0, isVisible: false });

    const [currentLine, setCurrentLine] = useState<any>(null);
    const currentLineRef = useRef<any>(null);

    const isDrawing = useRef(false);
    const isPanning = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const trRef = useRef<any>(null);

    // Zoom functions
    const handleWheel = (e: any) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const scaleBy = 1.1;
        let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        const MIN_SCALE = 0.05;
        const MAX_SCALE = 2;

        if (newScale < MIN_SCALE) {
            newScale = MIN_SCALE;
        } else if (newScale > MAX_SCALE) {
            newScale = MAX_SCALE;
        }

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setScale(newScale);
        setPosition(newPos);
        stage.position(newPos);
        stage.scale({ x: newScale, y: newScale });
        stage.batchDraw();
    };

    // Eraser functions
    const handleErase = (stage: any) => {
        const pos = stage.getRelativePointerPosition();
        const { nextLines, wasModified } = calculateEraser(lines, pos);
        if (wasModified) setLines(nextLines);
    };

    // Drawing functions for pen
    const startDrawing = (stage: any) => {
        isDrawing.current = true;
        const pos = stage.getRelativePointerPosition();

        const newLine = {
            id: Date.now().toString(),
            tool,
            points: [[pos.x, pos.y]],
            stroke: penSetting.color,
            strokeWidth: penSetting.size,
        };

        currentLineRef.current = newLine;
        setCurrentLine(newLine);
    };

    const continueDrawing = (stage: any) => {
        if (!isDrawing.current || !currentLineRef.current) return;

        const point = stage.getRelativePointerPosition();
        const liveLine = currentLineRef.current;

        const lastSegmentIndex = liveLine.points.length - 1;
        const prevPoints = liveLine.points[lastSegmentIndex];

        const newPoints = prevPoints.concat([point.x, point.y]);

        liveLine.points[lastSegmentIndex] = newPoints;

        setCurrentLine({ 
            ...liveLine, 
            points: [...liveLine.points]
        });
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

            const newPos = { x: stage.x() + dx, y: stage.y() + dy };
            stage.position(newPos);
            setPosition(newPos);

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

        if (isDrawing.current && currentLineRef.current) {
            useStore.getState().setLines([...useStore.getState().lines, currentLineRef.current]);
        }

        isDrawing.current = false;
        currentLineRef.current = null;
        setCurrentLine(null);

        e.target.getStage().container().style.cursor = 'default';
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

            onWheel={handleWheel}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}

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
                        rotation={line.rotation || 0}
                        scaleX={line.scaleX || 1}
                        scaleY={line.scaleY || 1}

                        onDragEnd={(e) => {
                            useStore.getState().updateLine(line.id, {
                                x: e.target.x(),
                                y: e.target.y()
                            });
                        }}

                        onTransformEnd={(e) => {
                            const node = e.target;
                            useStore.getState().updateLine(line.id, {
                                x: node.x(),
                                y: node.y(),
                                rotation: node.rotation(),
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                            });
                        }}
                    >
                        {line.points.map((segment: number[], index: number) => (
                            <Line
                                key={index}
                                points={segment}
                                stroke={line.stroke || '#000000'}
                                strokeWidth={line.strokeWidth || 5}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                listening={tool === 'cursor' || tool === 'eraser'}
                            />
                        ))}
                    </Group>
                ))}

                {currentLine && (
                    <Group>
                        {currentLine.points.map((segment: number[], index: number) => (
                            <Line
                                key={index}
                                points={segment}
                                stroke={currentLine.stroke}
                                strokeWidth={currentLine.strokeWidth}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                listening={false}
                            />
                        ))}
                    </Group>
                )}

                {/* Example Rect */}
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