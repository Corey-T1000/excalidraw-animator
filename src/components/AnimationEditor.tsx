import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import OpenColorPicker from './OpenColorPicker';
import { motion } from 'framer-motion';

// Export the Animation interface
export interface Animation {
  type: 'move' | 'rotate' | 'scale' | 'style';
  duration: number;
  delay: number;
  value: number | string | StyleValue;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  keyframes: Record<number, number | string | StyleValue>;
}

interface AnimationEditorProps {
  selectedElement: ExcalidrawElement | null;
  onAnimationUpdate: (elementId: string, animation: Animation) => void;
}

interface StyleValue {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
}

const AnimationEditor: React.FC<AnimationEditorProps> = ({ 
  selectedElement, 
  onAnimationUpdate 
}) => {
  const [animation, setAnimation] = useState<Animation>({
    type: 'move',
    duration: 1000,
    delay: 0,
    value: 0,
    easing: 'linear',
    keyframes: {},
  });

  useEffect(() => {
    if (selectedElement) {
      console.log('Selected element changed:', selectedElement);
      // Reset animation when a new element is selected
      setAnimation({
        type: 'move',
        duration: 1000,
        delay: 0,
        value: 0,
        easing: 'linear',
        keyframes: {},
      });
    }
  }, [selectedElement]);

  const handleAnimationChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setAnimation((prev) => ({
      ...prev,
      [name]: name === 'type' || name === 'easing' ? value :
               name === 'duration' || name === 'delay' ? Math.max(0, parseInt(value) || 0) :
               parseFloat(value) || 0,
    }));
  }, []);

  const handleStyleChange = useCallback((key: keyof StyleValue, value: string | number) => {
    setAnimation((prev) => ({
      ...prev,
      value: { ...(prev.value as StyleValue), [key]: value },
    }));
  }, []);

  const handleApplyAnimation = useCallback(() => {
    if (selectedElement) {
      console.log('Applying animation:', { elementId: selectedElement.id, animation });
      onAnimationUpdate(selectedElement.id, animation);
    } else {
      console.error('No element selected when trying to apply animation');
    }
  }, [selectedElement, animation, onAnimationUpdate]);

  const getValueInput = useMemo(() => {
    switch (animation.type) {
      case 'move':
      case 'rotate':
      case 'scale':
        return (
          <input
            type="number"
            name="value"
            value={animation.value as number}
            onChange={handleAnimationChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        );
      case 'style':
        return (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stroke Color</label>
              <OpenColorPicker
                value={(animation.value as StyleValue).strokeColor || ''}
                onChange={(color) => handleStyleChange('strokeColor', color)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stroke Width</label>
              <input
                type="number"
                value={(animation.value as StyleValue).strokeWidth || 0}
                onChange={(e) => handleStyleChange('strokeWidth', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fill Color</label>
              <OpenColorPicker
                value={(animation.value as StyleValue).backgroundColor || ''}
                onChange={(color) => handleStyleChange('backgroundColor', color)}
              />
            </div>
          </div>
        );
    }
  }, [animation.type, animation.value, handleAnimationChange, handleStyleChange]);

  if (!selectedElement) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 border-t border-gray-300"
    >
      <h2 className="text-lg font-semibold mb-4">Animation Editor</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animation type</label>
          <select
            name="type"
            value={animation.type}
            onChange={handleAnimationChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="move">Move</option>
            <option value="rotate">Rotate</option>
            <option value="scale">Scale</option>
            <option value="style">Style (Color/Width)</option>
          </select>
        </div>
        <div>
          {getValueInput}
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
            <input
              type="number"
              name="duration"
              value={animation.duration}
              onChange={handleAnimationChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Delay (ms)</label>
            <input
              type="number"
              name="delay"
              value={animation.delay}
              onChange={handleAnimationChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Easing</label>
          <select
            name="easing"
            value={animation.easing}
            onChange={handleAnimationChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In Out</option>
          </select>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleApplyAnimation}
        className="w-full bg-[#6965db] text-white py-2 px-4 rounded-md hover:bg-[#5b57c2] transition duration-300 mt-4"
      >
        Apply Animation
      </motion.button>
    </motion.div>
  );
};

export default React.memo(AnimationEditor);