import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
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
  }, [isAnimating, currentTime, excalidrawAPI, elements, animations]);

  const applyAnimation = (element: ExcalidrawElement, animation: Animation, time: number): ExcalidrawElement => {
    const progress = Math.min(1, Math.max(0, (time - animation.delay) / animation.duration));
    console.log(`Applying animation to element ${element.id}, progress: ${progress}`);

    switch (animation.type) {
      case 'move':
        return {
          ...element,
          x: element.x + (animation.value as number) * progress,
          y: element.y + (animation.value as number) * progress,
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
  };

  return (
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
      onChange={(elements, appState) => {
        onElementsChange(elements);
        const selectedElementIds = appState.selectedElementIds;
        const selectedElements = elements.filter(el => selectedElementIds[el.id]);
        onElementSelect(selectedElements.length === 1 ? selectedElements[0] : null);
      }}
    />
  );
});

export default ExcalidrawWrapper;