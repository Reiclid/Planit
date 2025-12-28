'use client';
import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Line, Circle } from 'react-konva';
import { useStore } from '@/store/useStore';

const Editor = () => {
    const { tool, lines, setLines } = useStore();

    const isDrawing = useRef(false);

    const handleMouseDown = (e: any) => {
        if (tool !== 'pen' && tool !== 'eraser') return;

        isDrawing.current = true;
        const pos = e.target.getStage().getRelativePointerPosition();

        const newLine = {
            id: Date.now().toString(),
            tool,
            points: [pos.x, pos.y]
        };

        setLines([...lines, newLine]);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing.current) return;

        const stage = e.target.getStage();
        const point = stage.getRelativePointerPosition();

        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    return (
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            draggable={tool === 'cursor'}
        >
            <Layer>
                {lines.map((line, i) => (
                    <Line
                        key={line.id}
                        points={line.points}
                        stroke={line.tool === 'eraser' ? '#df4b26' : '#000000'}
                        strokeWidth={line.tool === 'eraser' ? 25 : 5}

                        globalCompositeOperation={
                            line.tool === 'eraser' ? 'destination-out' : 'source-over'
                        }

                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                    />
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
            </Layer>
        </Stage>
    );
};

export default Editor;