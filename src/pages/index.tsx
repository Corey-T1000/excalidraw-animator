import React, { useState, useCallback } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Animation } from '../types/Animation';
import Timeline from '../components/Timeline';
import App from '../App';

const IndexPage: React.FC = () => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [duration, setDuration] = useState(5000); // 5 seconds default duration
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
  }, []);

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  const handleAnimationUpdate = useCallback((elementId: string, animation: Animation | null) => {
    setAnimations(prev => {
      if (animation === null) {
        const { [elementId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [elementId]: animation };
    });
  }, []);

  const handleStartAnimation = useCallback(() => {
    // Implement animation start logic here
    console.log('Animation started');
  }, []);

  const handleLoopToggle = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  return (
    <div>
      <App />
      <Timeline
        elements={elements}
        animations={animations}
        onSelectElement={handleElementSelect}
        selectedElementId={selectedElementId}
        duration={duration}
        currentTime={currentTime}
        onTimeChange={handleTimeChange}
        onAnimationUpdate={handleAnimationUpdate}
        onStartAnimation={handleStartAnimation}
        isLooping={isLooping}
        onLoopToggle={handleLoopToggle}
        onDurationChange={handleDurationChange}
      />
    </div>
  );
};

export default IndexPage;