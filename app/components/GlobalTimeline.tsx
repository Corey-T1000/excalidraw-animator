import React, { useRef } from 'react';
import { Play } from '../../src/components/Icons';

interface Animation {
  type: 'move' | 'rotate' | 'scale' | 'style';
  duration: number;
  delay: number;
  value: number | string | StyleValue;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<string, number | string | StyleValue>;
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
  onStartAnimation: () => void;
}

const GlobalTimeline: React.FC<GlobalTimelineProps> = ({
  duration,
  currentTime,
  onTimeChange,
  animations,
  onAnimationUpdate,
  onStartAnimation,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
    onTimeChange(Math.round(newTime));
  };

  return (
    <div className="w-full h-48 bg-gray-100 border-t border-gray-300 overflow-y-auto">
      <div className="flex items-start h-full">
        <div className="w-16 text-center">{currentTime}ms</div>
        <div className="flex-grow relative">
          <div className="flex items-center mb-2">
            <button
              onClick={onStartAnimation}
              className="mr-2 p-2 bg-[#6965db] text-white rounded-full hover:bg-[#5b57c2] transition duration-300"
              title="Start Animation"
            >
              <Play size={20} />
            </button>
            <div
              ref={timelineRef}
              className="flex-grow h-8 bg-gray-200 rounded cursor-pointer relative"
              onClick={handleTimelineClick}
            >
              <div
                className="absolute top-0 h-full bg-blue-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          {Object.entries(animations).map(([elementId, animation]) => (
            <div key={elementId} className="flex items-center mb-1">
              <div className="w-16 text-xs truncate">{elementId}</div>
              <div className="flex-grow h-4 bg-gray-200 rounded-full relative">
                <div
                  className="absolute top-0 h-full bg-green-500 rounded-full"
                  style={{
                    left: `${(animation.delay / duration) * 100}%`,
                    width: `${(animation.duration / duration) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="w-16 text-center">{duration}ms</div>
      </div>
    </div>
  );
};

export default GlobalTimeline;