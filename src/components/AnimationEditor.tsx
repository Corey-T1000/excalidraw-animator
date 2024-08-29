import React, { useState, useEffect } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Animation, MoveValue, StyleValue } from '../types/Animation';

interface AnimationEditorProps {
  selectedElement: ExcalidrawElement | null;
  onAnimationUpdate: (elementId: string, animation: Animation | null) => void;
  onAddToTimeline: (elementId: string, animation: Animation) => void;
}

const AnimationEditor: React.FC<AnimationEditorProps> = ({ selectedElement, onAnimationUpdate, onAddToTimeline }) => {
  const [animationType, setAnimationType] = useState<Animation['type']>('move');
  const [animationDuration, setAnimationDuration] = useState(1000);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [animationValue, setAnimationValue] = useState<Animation['value']>({ x: 0, y: 0 });
  const [animationEasing, setAnimationEasing] = useState<Animation['easing']>('linear');

  useEffect(() => {
    if (selectedElement) {
      // Reset animation values when a new element is selected
      setAnimationType('move');
      setAnimationDuration(1000);
      setAnimationDelay(0);
      setAnimationValue({ x: 0, y: 0 });
      setAnimationEasing('linear');
    }
  }, [selectedElement]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (animationType === 'move') {
      setAnimationValue(prev => ({
        ...(prev as MoveValue),
        [name]: parseFloat(value) || 0
      }));
    } else {
      setAnimationValue(parseFloat(value) || 0);
    }
  };

  const handleSubmit = () => {
    if (selectedElement) {
      const animation: Animation = {
        type: animationType,
        duration: animationDuration,
        delay: animationDelay,
        value: animationValue,
        easing: animationEasing,
        keyframes: {},
      };
      onAnimationUpdate(selectedElement.id, animation);
      onAddToTimeline(selectedElement.id, animation);
    }
  };

  const handleReset = () => {
    if (selectedElement) {
      onAnimationUpdate(selectedElement.id, null);
    }
  };

  if (!selectedElement) return null;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Animation Editor</h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Type:</label>
          <select
            value={animationType}
            onChange={(e) => setAnimationType(e.target.value as Animation['type'])}
            className="w-full p-2 border rounded"
          >
            <option value="move">Move</option>
            <option value="rotate">Rotate</option>
            <option value="scale">Scale</option>
            <option value="style">Style</option>
          </select>
        </div>
        {animationType === 'move' && (
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-1">X Movement:</label>
              <input
                type="number"
                name="x"
                value={(animationValue as MoveValue).x}
                onChange={handleValueChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1">Y Movement:</label>
              <input
                type="number"
                name="y"
                value={(animationValue as MoveValue).y}
                onChange={handleValueChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}
        {animationType !== 'move' && (
          <div>
            <label className="block mb-1">Value:</label>
            <input
              type="number"
              value={animationValue as number}
              onChange={handleValueChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block mb-1">Duration (ms):</label>
            <input
              type="number"
              value={animationDuration}
              onChange={(e) => setAnimationDuration(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Delay (ms):</label>
            <input
              type="number"
              value={animationDelay}
              onChange={(e) => setAnimationDelay(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1">Easing:</label>
          <select
            value={animationEasing}
            onChange={(e) => setAnimationEasing(e.target.value as Animation['easing'])}
            className="w-full p-2 border rounded"
          >
            <option value="linear">Linear</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="easeInOut">Ease In Out</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-primary text-white p-2 rounded hover:bg-primary-darker transition-colors duration-200"
          >
            Add Animation
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditor;