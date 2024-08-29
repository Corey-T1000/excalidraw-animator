import React, { useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";
import { Animation } from './AnimationEditor';

interface ExcalidrawRendererProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  currentTime: number;
}

const ExcalidrawRenderer = forwardRef<ExcalidrawImperativeAPI, ExcalidrawRendererProps>(
  ({ elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime }, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

    useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

    const applyAnimation = (element: ExcalidrawElement, animation: Animation, progress: number) => {
      const { type, value } = animation;
      const clampedProgress = Math.min(1, Math.max(0, progress));
      switch (type) {
        case 'move':
          return {
            ...element,
            x: element.x + (value as number) * clampedProgress,
            y: element.y + (value as number) * clampedProgress,
          };
        case 'rotate':
          return {
            ...element,
            angle: (element.angle || 0) + (value as number) * clampedProgress,
          };
        case 'scale':
          const scale = 1 + (value as number - 1) * clampedProgress;
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
              element.strokeWidth + (styleValue.strokeWidth - (element.strokeWidth || 0)) * clampedProgress : 
              element.strokeWidth,
            backgroundColor: styleValue.backgroundColor || element.backgroundColor,
          };
        default:
          return element;
      }
    };

    const updateScene = useCallback(() => {
      if (isAnimating && excalidrawAPI) {
        console.log('Starting animation in ExcalidrawRenderer');
        const newElements = elements.map(element => {
          const animation = animations[element.id];
          if (animation) {
            return applyAnimation(element, animation, currentTime / animation.duration);
          }
          return element;
        });
        excalidrawAPI.updateScene({ elements: newElements });
      }
    }, [isAnimating, currentTime, excalidrawAPI, elements, animations]);

    useEffect(() => {
      updateScene();
    }, [updateScene]);

    const handleChange = (elements: readonly ExcalidrawElement[], appState: AppState) => {
      onElementsChange(elements);
      const selectedElementIds = appState.selectedElementIds;
      const selectedElements = elements.filter(el => selectedElementIds[el.id]);
      onElementSelect(selectedElements.length === 1 ? selectedElements[0] : null);
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
        onChange={(elements, appState) => handleChange(elements, appState)}
      />
    );
  }
);

export default ExcalidrawRenderer;