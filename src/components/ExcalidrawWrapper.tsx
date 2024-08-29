import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Animation, MoveValue, StyleValue } from '../types/Animation';

export interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  currentTime: number;
}

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>((props, ref) => {
  const { elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime } = props;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

  const applyAnimation = useCallback((element: ExcalidrawElement, animation: Animation, time: number): ExcalidrawElement => {
    const progress = Math.min(1, Math.max(0, (time - animation.delay) / animation.duration));
    console.log(`Applying animation to element ${element.id}, progress: ${progress}`);

    switch (animation.type) {
      case 'move':
        const moveValue = animation.value as MoveValue;
        return {
          ...element,
          x: element.x + moveValue.x * progress,
          y: element.y + moveValue.y * progress,
        };
      case 'rotate':
        return {
          ...element,
          angle: (element.angle || 0) + (animation.value as number) * progress,
        };
      case 'scale':
        const scale = 1 + ((animation.value as number) - 1) * progress;
        return {
          ...element,
          width: (element.width || 0) * scale,
          height: (element.height || 0) * scale,
        };
      case 'style':
        const styleValue = animation.value as StyleValue;
        return {
          ...element,
          strokeColor: styleValue.strokeColor || element.strokeColor,
          strokeWidth: styleValue.strokeWidth !== undefined ? 
            element.strokeWidth + (styleValue.strokeWidth - (element.strokeWidth || 0)) * progress : 
            element.strokeWidth,
          backgroundColor: styleValue.backgroundColor || element.backgroundColor,
        };
      default:
        return element;
    }
  }, []);

  useEffect(() => {
    if (isAnimating && excalidrawAPI) {
      console.log('Animating elements:', elements);
      console.log('Current time:', currentTime);
      console.log('Animations:', animations);

      const animatedElements = elements.map(element => {
        const animation = animations[element.id];
        if (animation) {
          console.log(`Applying animation to element ${element.id}:`, animation);
          return applyAnimation(element, animation, currentTime);
        }
        return element;
      });

      console.log('Animated elements:', animatedElements);
      excalidrawAPI.updateScene({ elements: animatedElements });
    }
  }, [isAnimating, currentTime, excalidrawAPI, elements, animations, applyAnimation]);

  const handleChange = useCallback((newElements: readonly ExcalidrawElement[], appState: any) => {
    if (!isAnimating) {
      onElementsChange(newElements);
      const selectedElementIds = appState.selectedElementIds;
      const selectedElements = newElements.filter(el => selectedElementIds[el.id]);
      onElementSelect(selectedElements.length === 1 ? selectedElements[0] : null);
    }
  }, [isAnimating, onElementsChange, onElementSelect]);

  const handleZoomIn = () => {
    if (excalidrawAPI) {
      const currentZoom = excalidrawAPI.getAppState().zoom;
      excalidrawAPI.updateScene({
        appState: { 
          zoom: {
            value: Math.min(currentZoom.value * 1.2, 10) as any
          }
        }
      });
    }
  };

  const handleZoomOut = () => {
    if (excalidrawAPI) {
      const currentZoom = excalidrawAPI.getAppState().zoom;
      excalidrawAPI.updateScene({
        appState: { 
          zoom: {
            value: Math.max(currentZoom.value / 1.2, 0.1) as any
          }
        }
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api);
          if (typeof ref === 'function') {
            ref(api);
          } else if (ref) {
            ref.current = api;
          }
        }}
        initialData={{
          elements: elements,
          appState: { viewBackgroundColor: '#ffffff' },
        }}
        onChange={handleChange}
      />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button onClick={handleZoomIn} className="p-2 bg-white rounded-full shadow">+</button>
        <button onClick={handleZoomOut} className="p-2 bg-white rounded-full shadow">-</button>
      </div>
    </div>
  );
});

export default React.memo(ExcalidrawWrapper);