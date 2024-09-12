import React, { useState, useCallback, useRef } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Animation } from '../types/Animation';

interface TimelineProps {
  elements: ExcalidrawElement[];
  animations: Record<string, Animation>;
  onSelectElement: (elementId: string) => void;
  selectedElementId: string | null;
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  onAnimationUpdate: (elementId: string, animation: Animation | null) => void;
  onStartAnimation: () => void;
  isLooping: boolean;
  onLoopToggle: () => void;
  onDurationChange: (newDuration: number) => void; // New prop
}

const Timeline: React.FC<TimelineProps> = ({
  elements,
  animations,
  onSelectElement,
  selectedElementId,
  duration,
  currentTime,
  onTimeChange,
  onAnimationUpdate,
  onStartAnimation,
  isLooping,
  onLoopToggle,
  onDurationChange, // New prop
}) => {
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const getTimelinePosition = useCallback((clientX: number) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, position)) * duration;
    }
    return 0;
  }, [duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, type: 'start' | 'end' | 'move') => {
    setDraggingElement(elementId);
    setDragType(type);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingElement && dragType) {
      const newTime = getTimelinePosition(e.clientX);
      const animation = animations[draggingElement];
      if (animation) {
        let newAnimation: Animation;
        switch (dragType) {
          case 'start':
            newAnimation = { ...animation, delay: newTime };
            break;
          case 'end':
            newAnimation = { ...animation, duration: newTime - animation.delay };
            break;
          case 'move':
            const moveDistance = newTime - (animation.delay + animation.duration / 2);
            newAnimation = { ...animation, delay: animation.delay + moveDistance };
            break;
        }
        onAnimationUpdate(draggingElement, newAnimation);
      }
    }
  }, [draggingElement, dragType, animations, getTimelinePosition, onAnimationUpdate]);

  const handleMouseUp = useCallback(() => {
    setDraggingElement(null);
    setDragType(null);
  }, []);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Math.max(1000, parseInt(e.target.value)); // Minimum 1 second
    onDurationChange(newDuration);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-2">Timeline</h3>
      <div 
        className="relative h-40 border border-gray-300"
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((element) => {
          const animation = animations[element.id];
          if (!animation) return null;

          const startPercent = (animation.delay / duration) * 100;
          const widthPercent = (animation.duration / duration) * 100;

          return (
            <div
              key={element.id}
              className={`absolute h-8 bg-blue-200 border border-blue-400 rounded ${
                selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
                top: `${elements.indexOf(element) * 40}px`,
              }}
              onClick={() => onSelectElement(element.id)}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'start')}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-2 bg-blue-400 cursor-ew-resize"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'end')}
              />
              <div 
                className="absolute left-2 right-2 top-0 bottom-0 cursor-move"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'move')}
              >
                {element.type} - {element.id.slice(0, 8)}
              </div>
            </div>
          );
        })}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          <span>{currentTime.toFixed(2)}s</span>
          <span>{(duration / 1000).toFixed(2)}s</span>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Total Duration (ms):
          <input
            type="number"
            min="1000"
            step="100"
            value={duration}
            onChange={handleDurationChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={onStartAnimation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLooping ? 'Loop' : 'Play'}
        </button>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isLooping}
            onChange={onLoopToggle}
            className="mr-2"
          />
          Loop
        </label>
      </div>
    </div>
  );
};

export default Timeline;