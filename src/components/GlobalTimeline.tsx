import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Animation {
  type: 'move' | 'rotate' | 'scale' | 'style';
  duration: number;
  delay: number;
  value: number | string | StyleValue;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<number, number | string | StyleValue>;
}

interface StyleValue {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

interface GlobalTimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  animations: Record<string, Animation>;
  onAnimationUpdate: (elementId: string, animation: Animation) => void;
}

const GlobalTimeline: React.FC<GlobalTimelineProps> = ({
  duration,
  currentTime,
  onTimeChange,
  animations,
  onAnimationUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ elementId: string; time: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
        onTimeChange(Math.round(newTime));
      }
      if (draggingKeyframe && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(duration, Math.round((x / rect.width) * duration)));
        const { elementId, time } = draggingKeyframe;
        const animation = animations[elementId];
        const newKeyframes = { ...animation.keyframes };
        delete newKeyframes[time];
        newKeyframes[newTime] = animation.keyframes[time];
        onAnimationUpdate(elementId, { ...animation, keyframes: newKeyframes });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingKeyframe(null);
    };

    if (isDragging || draggingKeyframe) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingKeyframe, duration, onTimeChange, animations, onAnimationUpdate]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
    onTimeChange(Math.round(newTime));
  };

  const handleKeyframeMouseDown = (elementId: string, time: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingKeyframe({ elementId, time });
  };

  return (
    <div className="w-full h-48 bg-gray-100 border-t border-gray-300 overflow-y-auto">
      <div className="flex items-start h-full">
        <div className="w-16 text-center">{currentTime}ms</div>
        <div className="flex-grow relative">
          <div
            ref={timelineRef}
            className="h-8 bg-gray-200 rounded cursor-pointer relative"
            onClick={handleTimelineClick}
          >
            <motion.div
              className="absolute top-0 w-1 h-full bg-red-500"
              style={{ left: `${(currentTime / duration) * 100}%` }}
              drag="x"
              dragConstraints={timelineRef}
              dragElastic={0}
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            />
          </div>
          {Object.entries(animations).map(([elementId, animation], index) => (
            <div
              key={elementId}
              className="h-8 relative mt-1"
              style={{ top: `${index * 32}px` }}
            >
              <div className="absolute left-0 w-16 text-xs truncate">{elementId}</div>
              {Object.entries(animation.keyframes).map(([time, value]) => (
                <div
                  key={`${elementId}-${time}`}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-move"
                  style={{ left: `${(Number(time) / duration) * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                  onMouseDown={(e) => handleKeyframeMouseDown(elementId, Number(time), e)}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="w-16 text-center">{duration}ms</div>
      </div>
    </div>
  );
};

export default GlobalTimeline;