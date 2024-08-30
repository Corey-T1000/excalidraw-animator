import React, { useState, useEffect } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Animation } from '../types/Animation';

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
  const [rotationType, setRotationType] = useState<'degrees' | 'revolutions'>('degrees');
  const [isReverse, setIsReverse] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      resetAnimationValues();
    }
  }, [selectedElement]);

  const resetAnimationValues = () => {
    setAnimationType('move');
    setAnimationDuration(1000);
    setAnimationDelay(0);
    setAnimationValue({ x: 0, y: 0 });
    setAnimationEasing('linear');
    setRotationType('degrees');
    setIsReverse(false);
    setIsLoop(false);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as Animation['type'];
    setAnimationType(newType);
    
    switch (newType) {
      case 'move':
        setAnimationValue({ x: 0, y: 0 });
        break;
      case 'rotate':
        setAnimationValue(0);
        break;
      case 'scale':
        setAnimationValue(1);
        break;
      case 'style':
        setAnimationValue({ strokeColor: '', strokeWidth: 0, backgroundColor: '' });
        break;
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (animationType === 'move') {
      setAnimationValue(prev => ({
        ...(prev as { x: number; y: number }),
        [name]: parseFloat(value) || 0
      }));
    } else if (animationType === 'rotate') {
      let rotationValue = parseFloat(value) || 0;
      if (rotationType === 'revolutions') {
        rotationValue *= 360;
      }
      setAnimationValue(rotationValue);
    } else if (animationType === 'scale') {
      setAnimationValue(Math.max(0.1, parseFloat(value) || 1));
    } else if (animationType === 'style') {
      setAnimationValue(prev => ({
        ...(prev as { strokeColor: string; strokeWidth: number; backgroundColor: string }),
        [name]: name === 'strokeWidth' ? (parseFloat(value) || 0) : value
      }));
    }
  };

  const handleSubmit = () => {
    if (selectedElement) {
      let finalValue = animationValue;
      if (animationType === 'rotate') {
        finalValue = (animationValue as number) * (Math.PI / 180);
      }
      const animation: Animation = {
        type: animationType,
        duration: animationDuration,
        delay: animationDelay,
        value: finalValue,
        easing: animationEasing,
        keyframes: {},
        isReverse,
        isLoop,
      };
      onAnimationUpdate(selectedElement.id, animation);
      onAddToTimeline(selectedElement.id, animation);
    }
  };

  const handleReset = () => {
    if (selectedElement) {
      onAnimationUpdate(selectedElement.id, null);
      resetAnimationValues();
    }
  };

  if (!selectedElement) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="text-lg font-semibold mb-2">Animation Editor</h3>
        <select
          value={animationType}
          onChange={handleTypeChange}
          className="w-full p-2 border rounded"
        >
          <option value="move">Move</option>
          <option value="rotate">Rotate</option>
          <option value="scale">Scale</option>
          <option value="style">Style</option>
        </select>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {animationType === 'move' && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block mb-1">X Movement:</label>
                <input
                  type="number"
                  name="x"
                  value={(animationValue as { x: number; y: number }).x}
                  onChange={handleValueChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1">Y Movement:</label>
                <input
                  type="number"
                  name="y"
                  value={(animationValue as { x: number; y: number }).y}
                  onChange={handleValueChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
          {animationType === 'rotate' && (
            <div>
              <div className="flex items-center justify-center mb-2">
                <button
                  onClick={() => setRotationType('degrees')}
                  className={`px-4 py-2 rounded-l-md ${rotationType === 'degrees' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Degrees
                </button>
                <button
                  onClick={() => setRotationType('revolutions')}
                  className={`px-4 py-2 rounded-r-md ${rotationType === 'revolutions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Revolutions
                </button>
              </div>
              <label className="block mb-1">
                Rotation ({rotationType === 'degrees' ? 'degrees' : 'revolutions'}):
              </label>
              <input
                type="number"
                name="rotate"
                value={rotationType === 'degrees' ? animationValue as number : (animationValue as number) / 360}
                onChange={handleValueChange}
                step={rotationType === 'degrees' ? 1 : 0.25}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {animationType === 'scale' && (
            <div>
              <label className="block mb-1">Scale Factor:</label>
              <input
                type="number"
                name="scale"
                value={animationValue as number}
                onChange={handleValueChange}
                step="0.1"
                min="0.1"
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          {animationType === 'style' && (
            <div className="space-y-2">
              <div>
                <label className="block mb-1">Stroke Color:</label>
                <input
                  type="color"
                  name="strokeColor"
                  value={(animationValue as { strokeColor: string }).strokeColor}
                  onChange={handleValueChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Stroke Width:</label>
                <input
                  type="number"
                  name="strokeWidth"
                  min="0"
                  value={(animationValue as { strokeWidth: number }).strokeWidth}
                  onChange={handleValueChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Background Color:</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={(animationValue as { backgroundColor: string }).backgroundColor}
                  onChange={handleValueChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          )}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-1">Duration (ms):</label>
              <input
                type="number"
                name="duration"
                value={animationDuration}
                onChange={(e) => setAnimationDuration(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1">Delay (ms):</label>
              <input
                type="number"
                name="delay"
                value={animationDelay}
                onChange={(e) => setAnimationDelay(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
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
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reverse"
                checked={isReverse}
                onChange={(e) => setIsReverse(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="reverse">Reverse</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="loop"
                checked={isLoop}
                onChange={(e) => setIsLoop(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="loop">Loop</label>
            </div>
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
    </div>
  );
};

export default AnimationEditor;