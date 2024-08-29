import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  currentTime: number;
}

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

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>((props, ref) => {
  const { elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime } = props;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

  const getEasedProgress = useCallback((progress: number, easing: string): number => {
    switch (easing) {
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - (1 - progress) * (1 - progress);
      case 'easeInOut':
        return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default: // linear
        return progress;
    }
  }, []);

  const applyAnimation = useCallback((element: ExcalidrawElement, animation: Animation, time: number): ExcalidrawElement => {
    const { type, value, duration, delay, easing } = animation;
    const progress = Math.max(0, Math.min(1, (time - delay) / duration));
    const easedProgress = getEasedProgress(progress, easing);

    switch (type) {
      case 'move':
        return {
          ...element,
          x: element.x + (value as number) * easedProgress,
          y: element.y + (value as number) * easedProgress,
        };
      case 'rotate':
        return {
          ...element,
          angle: (element.angle || 0) + (value as number) * easedProgress,
        };
      case 'scale':
        const scale = 1 + ((value as number) - 1) * easedProgress;
        return {
          ...element,
          width: (element.width || 0) * scale,
          height: (element.height || 0) * scale,
        };
      case 'style':
        const styleValue = value as StyleValue;
        return {
          ...element,
          strokeColor: styleValue.strokeColor || element.strokeColor,
          strokeWidth: styleValue.strokeWidth !== undefined ? 
            element.strokeWidth + (styleValue.strokeWidth - (element.strokeWidth || 0)) * easedProgress : 
            element.strokeWidth,
          backgroundColor: styleValue.backgroundColor || element.backgroundColor,
        };
      default:
        return element;
    }
  }, [getEasedProgress]);

  useEffect(() => {
    if (isAnimating && excalidrawAPI) {
      const animatedElements = elements.map(element => {
        const animation = animations[element.id];
        if (animation) {
          return applyAnimation(element, animation, currentTime);
        }
        return element;
      });

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