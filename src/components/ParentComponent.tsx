import React, { useCallback, useState } from 'react';
import AnimationEditor from './AnimationEditor';
import { Animation } from '../types/Animation';

const ParentComponent: React.FC = () => {
  const [animations, setAnimations] = useState<Record<string, Animation>>({});

  const handleAnimationUpdate = useCallback((elementId: string, animation: Animation | null) => {
    // Existing animation update logic
    console.log(`Updating animation for element ${elementId}:`, animation);
    setAnimations(prev => {
      if (animation === null) {
        const { [elementId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [elementId]: animation };
    });
  }, []);

  const handleAddToTimeline = useCallback((elementId: string, animation: Animation) => {
    // Add to timeline logic
    console.log(`Adding animation to timeline for element ${elementId}:`, animation);
    // You would typically update your timeline state or call a parent component's method here
  }, []);

  return (
    <div>
      {/* Other components */}
      <AnimationEditor
        selectedElement={null} // You might want to pass a real selected element here
        animation={null} // Add this line
        onAnimationUpdate={handleAnimationUpdate}
        onAddToTimeline={handleAddToTimeline}
      />
    </div>
  );
};

export default ParentComponent;