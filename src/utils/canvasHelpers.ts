import Konva from 'konva';

const getAbsolutePoint = (point: {x: number, y: number}, line: any) => {
    const tr = new Konva.Transform();
    
    tr.translate(line.x || 0, line.y || 0);
    
    const rotationInRadians = (line.rotation || 0) * (Math.PI / 180);
    tr.rotate(rotationInRadians);
    
    tr.scale(line.scaleX || 1, line.scaleY || 1);
    
    return tr.point(point);
};

export const calculateEraser = (lines: any[], pos: { x: number, y: number }) => {
    const eraserRadius = 15;
    let wasModified = false;

    const nextLines = lines.map((line) => {
        if (!line.points) return line;

        const newSegments: number[][] = [];

        line.points.forEach((segment: number[]) => {
            let currentPath: number[] = [];
            
            for (let i = 0; i < segment.length; i += 2) {
                const localPoint = { x: segment[i], y: segment[i + 1] };
                
                const absPoint = getAbsolutePoint(localPoint, line);
                
                const dist = Math.sqrt(Math.pow(absPoint.x - pos.x, 2) + Math.pow(absPoint.y - pos.y, 2));

                if (dist > eraserRadius) {
                    currentPath.push(segment[i], segment[i + 1]);
                } else {
                    if (currentPath.length >= 4) newSegments.push(currentPath);
                    wasModified = true;
                    currentPath = [];
                }
            }
            if (currentPath.length >= 4) newSegments.push(currentPath);
        });

        return { ...line, points: newSegments };
    });

    return { nextLines, wasModified };
};

export const calculateSelection = (lines: any[], selectionRect: any) => {
    const box = {
        x: selectionRect.width > 0 ? selectionRect.x : selectionRect.x + selectionRect.width,
        y: selectionRect.height > 0 ? selectionRect.y : selectionRect.y + selectionRect.height,
        width: Math.abs(selectionRect.width),
        height: Math.abs(selectionRect.height),
    };

    return lines.filter((line) => {
        const allPoints = line.points.flat();
        if (allPoints.length === 0) return false;

        for (let i = 0; i < allPoints.length; i += 2) {
             const absPoint = getAbsolutePoint({ x: allPoints[i], y: allPoints[i+1] }, line);
             
             if (
                 absPoint.x >= box.x && 
                 absPoint.x <= box.x + box.width &&
                 absPoint.y >= box.y && 
                 absPoint.y <= box.y + box.height
             ) {
                 return true;
             }
        }
        return false;
    }).map((line) => line.id);
};