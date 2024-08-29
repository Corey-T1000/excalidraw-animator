import React, { useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { ExcalidrawImperativeAPI, AppState } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Animation } from './AnimationEditor';

interface ExcalidrawRendererProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  currentTime: number;
}

const ExcalidrawRenderer = React.forwardRef<ExcalidrawImperativeAPI, ExcalidrawRendererProps>(
  ({ elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime }, ref) => {
    const animationRef = useRef<number>();

    const applyAnimation = (element: ExcalidrawElement, animation: Animation, progress: number) => {
      const { type, value } = animation;
      switch (type) {
        case 'move':
          return {
            ...element,
            x: element.x + (value as number) * progress,
            y: element.y + (value as number) * progress,
          };
        case 'rotate':
          return {
            ...element,
            angle: (element.angle || 0) + (value as number) * progress,
          };
        case 'scale':
          const scale = 1 + (value as number - 1) * progress;
          return {
            ...element,
            width: (element.width || 0) * scale,
            height: (element.height || 0) * scale,
          };
        case 'style':
          const styleValue = value as { strokeColor?: string; strokeWidth?: number; backgroundColor?: string };
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

    const easing = (t: number, easingType: string) => {
      switch (easingType) {
        case 'easeIn': return t * t;
        case 'easeOut': return 1 - Math.pow(1 - t, 2);
        case 'easeInOut': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        default: return t; // linear
      }
    };

    useEffect(() => {
      if (isAnimating) {
        console.log('Starting animation in ExcalidrawRenderer');
        const newElements = elements.map(element => {
          const animation = animations[element.id];
          if (animation) {
            return applyAnimation(element, animation, currentTime);
          }
          return element;
        });
        setAnimatedElements(newElements);
      } else {
        setAnimatedElements(elements);
      }
    }, [isAnimating, elements, animations, currentTime]);

    const handleChange = (elements: readonly ExcalidrawElement[], appState: AppState) => {
      onElementsChange(elements);
      const selectedElementIds = appState.selectedElementIds;
      const selectedElements = elements.filter(el => selectedElementIds[el.id]);
      onElementSelect(selectedElements.length === 1 ? selectedElements[0] : null);
    };

    return (
      <Excalidraw
        ref={ref}
        initialData={{
          elements: elements,
          appState: { viewBackgroundColor: '#ffffff' },
        }}
        onChange={handleChange}
      />
    );
  }
);

export default ExcalidrawRenderer;