import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Animation, MoveValue, StyleValue } from '../types/Animation';

export interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  onElementsDeleted?: (deletedElementIds: string[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (elementId: string | null) => void;
  currentTime: number;
  totalDuration: number;
  isResetting: boolean;
}

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>((props, ref) => {
  const { elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime, totalDuration, isResetting } = props;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const originalElementsRef = useRef<ExcalidrawElement[]>([]);

  useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

  useEffect(() => {
    originalElementsRef.current = elements;
  }, [elements]);

  const applyAnimation = useCallback((originalElement: ExcalidrawElement, animation: Animation, time: number): ExcalidrawElement => {
    const progress = Math.min(1, Math.max(0, (time - animation.delay) / animation.duration));

    switch (animation.type) {
      case 'move':
        const moveValue = animation.value as MoveValue;
        return {
          ...originalElement,
          x: originalElement.x + moveValue.x * progress,
          y: originalElement.y + moveValue.y * progress,
        };
      case 'rotate':
        return {
          ...originalElement,
          angle: (originalElement.angle || 0) + (animation.value as number) * progress,
        };
      case 'scale':
        const scale = 1 + ((animation.value as number) - 1) * progress;
        return {
          ...originalElement,
          width: (originalElement.width || 0) * scale,
          height: (originalElement.height || 0) * scale,
        };
      case 'style':
        const styleValue = animation.value as StyleValue;
        return {
          ...originalElement,
          strokeColor: styleValue.strokeColor || originalElement.strokeColor,
          strokeWidth: styleValue.strokeWidth !== undefined ? 
            originalElement.strokeWidth + (styleValue.strokeWidth - (originalElement.strokeWidth || 0)) * progress : 
            originalElement.strokeWidth,
          backgroundColor: styleValue.backgroundColor || originalElement.backgroundColor,
        };
      default:
        return originalElement;
    }
  }, []);

  useEffect(() => {
    if (excalidrawAPI) {
      let elementsToRender: ExcalidrawElement[];

      if (isResetting || currentTime === 0) {
        elementsToRender = originalElementsRef.current;
      } else {
        elementsToRender = originalElementsRef.current.map(element => {
          const animation = animations[element.id];
          if (animation) {
            if (currentTime >= animation.delay && currentTime <= animation.delay + animation.duration) {
              return applyAnimation(element, animation, currentTime);
            } else if (currentTime > animation.delay + animation.duration) {
              return applyAnimation(element, animation, animation.delay + animation.duration);
            }
          }
          return element;
        });
      }

      excalidrawAPI.updateScene({ elements: elementsToRender });
    }
  }, [currentTime, excalidrawAPI, animations, applyAnimation, isAnimating, isResetting]);

  const handleChange = useCallback((newElements: readonly ExcalidrawElement[], appState: any) => {
    if (!isAnimating) {
      const deletedElementIds = elements
        .filter(el => !newElements.some(newEl => newEl.id === el.id))
        .map(el => el.id);

      onElementsChange(newElements);

      if (deletedElementIds.length > 0) {
        props.onElementsDeleted?.(deletedElementIds);
      }

      const selectedElementIds = appState.selectedElementIds;
      const selectedElements = newElements.filter(el => selectedElementIds[el.id]);
      onElementSelect(selectedElements.length === 1 ? selectedElements[0].id : null);

      // Update original elements
      originalElementsRef.current = [...newElements];
    }
  }, [isAnimating, onElementsChange, onElementSelect, elements, props]);

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