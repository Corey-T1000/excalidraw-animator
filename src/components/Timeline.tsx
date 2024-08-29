import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TimelineProps {
  duration: number;
  keyframes: Record<number, number | string | StyleValue>;
  onKeyframeAdd: (time: number) => void;
  onKeyframeMove: (oldTime: number, newTime: number) => void;
  onKeyframeDelete: (time: number) => void;
}

interface StyleValue {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

interface PanInfo {
  point: { x: number; y: number };
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  keyframes,
  onKeyframeAdd,
  onKeyframeMove,
  onKeyframeDelete,
}) => {
  const [draggedKeyframe, setDraggedKeyframe] = useState<number | null>(null);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.round((x / rect.width) * duration);
    onKeyframeAdd(time);
  }, [duration, onKeyframeAdd]);

  const handleKeyframeDragStart = useCallback((time: number) => {
    setDraggedKeyframe(time);
  }, []);

  const handleKeyframeDrag = useCallback((time: number, info: PanInfo) => {
    if (draggedKeyframe !== null) {
      const timelineWidth = document.querySelector('.timeline-container')?.clientWidth || 200;
      const newTime = Math.max(0, Math.min(duration, time + (info.offset.x / timelineWidth) * duration));
      onKeyframeMove(time, Math.round(newTime));
    }
  }, [draggedKeyframe, duration, onKeyframeMove]);

  const handleKeyframeDragEnd = useCallback(() => {
    setDraggedKeyframe(null);
  }, []);

  const visibleKeyframes = Object.entries(keyframes)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 10); // Limit to 10 visible keyframes

  return (
    <div className="mt-4">
      <div
        className="timeline-container relative w-full h-8 bg-gray-200 rounded cursor-pointer"
        onClick={handleTimelineClick}
      >
        {visibleKeyframes.map(([time, value]) => (
          <motion.div
            key={time}
            className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move"
            style={{ left: `${(Number(time) / duration) * 100}%`, top: '50%', marginTop: '-8px' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
            onDragStart={() => handleKeyframeDragStart(Number(time))}
            onDrag={(_: React.MouseEvent<HTMLDivElement>, info: PanInfo) => handleKeyframeDrag(Number(time), info)}
            onDragEnd={handleKeyframeDragEnd}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs">
              {time}ms
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;