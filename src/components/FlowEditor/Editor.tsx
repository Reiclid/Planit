'use client';
import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Line, Circle } from 'react-konva';
import { useStore } from '@/store/useStore';

const Editor = () => {
    const { tool } = useStore();

    const [lines, setLines] = useState<any[]>([]);
    const isDrawing = useRef(false);

    const handleMouseDown = (e: any) => {
        if (tool !== 'pen') return;

        isDrawing.current = true;
        const pos = e.target.getStage().getRelativePointerPosition();

        setLines([...lines, { tool, points: [pos.x, pos.y] }]);
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
                {/* Тут рендеримо всі лінії */}
                {lines.map((line, i) => (
                    <Line
                        key={i}
                        points={line.points}
                        stroke="#df4b26"
                        strokeWidth={5}
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
                    draggable={tool === 'cursor'} // Блоки можна тягати тільки в режимі курсора
                />
            </Layer>
        </Stage>
    );
};

export default Editor;