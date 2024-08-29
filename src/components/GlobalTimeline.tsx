import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack } from './Icons';
import { Animation } from '../types/Animation';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

interface GlobalTimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  animations: Record<string, Animation>;
  elements: ExcalidrawElement[];
  onAnimationUpdate: (elementId: string, animation: Animation) => void;
  onStartAnimation: () => void;
}

const GlobalTimeline: React.FC<GlobalTimelineProps> = ({
  duration,
  currentTime,
  onTimeChange,
  animations,
  elements,
  onAnimationUpdate,
  onStartAnimation,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingAnimation, setDraggingAnimation] = useState<{ elementId: string; type: 'start' | 'end' } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isAnimating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
        onTimeChange(Math.round(newTime));
      }
      if (draggingAnimation && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = Math.max(0, Math.min(duration, Math.round((x / rect.width) * duration)));
        const { elementId, type } = draggingAnimation;
        const animation = animations[elementId];
        if (type === 'start') {
          const newDelay = Math.min(newTime, animation.delay + animation.duration - 100);
          const newDuration = animation.delay + animation.duration - newDelay;
          onAnimationUpdate(elementId, { ...animation, delay: newDelay, duration: newDuration });
        } else {
          const newDuration = Math.max(100, newTime - animation.delay);
          onAnimationUpdate(elementId, { ...animation, duration: newDuration });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingAnimation(null);
    };

    if (isDragging || draggingAnimation) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggingAnimation, duration, onTimeChange, animations, onAnimationUpdate]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
    onTimeChange(Math.round(newTime));
  };

  const handleAnimationDragStart = (elementId: string, type: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingAnimation({ elementId, type });
  };

  return (
    <div className="w-full bg-gray-100 border-t border-gray-300 p-4">
      <div className="flex flex-wrap items-center mb-2">
        <button
          onClick={onStartAnimation}
          className="mr-2 p-2 bg-[#6965db] text-white rounded-full hover:bg-[#5b57c2] transition duration-300"
          title="Start Animation"
        >
          {isAnimating ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={() => onTimeChange(0)}
          className="mr-2 p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-300"
          title="Reset Animation"
        >
          <SkipBack size={20} />
        </button>
        <div className="text-sm font-medium">{currentTime}ms / {duration}ms</div>
      </div>
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
      <div className="mt-2 space-y-2">
        {elements.map((element) => {
          const animation = animations[element.id];
          if (!animation) return null;
          
          const elementName = element.customData?.name || `${element.type}-${element.id.slice(0, 4)}`;
          
          return (
            <div key={element.id} className="h-6 relative">
              <div className="absolute left-0 w-16 text-xs truncate">{elementName}</div>
              <div className="ml-16 h-full bg-gray-200 rounded-full relative">
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{
                    left: `${(animation.delay / duration) * 100}%`,
                    width: `${(animation.duration / duration) * 100}%`,
                  }}
                >
                  <div
                    className="absolute left-0 w-2 h-full bg-blue-700 cursor-ew-resize"
                    onMouseDown={(e) => handleAnimationDragStart(element.id, 'start', e)}
                  />
                  <div
                    className="absolute right-0 w-2 h-full bg-blue-700 cursor-ew-resize"
                    onMouseDown={(e) => handleAnimationDragStart(element.id, 'end', e)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalTimeline;