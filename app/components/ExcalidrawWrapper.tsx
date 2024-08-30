import React, { useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";
import { Animation } from '../types/Animation';

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  onElementsChange: (elements: readonly ExcalidrawElement[]) => void;
  animations: Record<string, Animation>;
  isAnimating: boolean;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  currentTime: number;
}

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>(
  ({ elements, onElementsChange, animations, isAnimating, onElementSelect, currentTime }, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

    const applyAnimation = (element: ExcalidrawElement, animation: Animation, progress: number) => {
      const { type, value, isReverse } = animation;
      const clampedProgress = isReverse ? 1 - Math.min(1, Math.max(0, progress)) : Math.min(1, Math.max(0, progress));
      switch (type) {
        case 'move':
          return {
            ...element,
            x: element.x + (value as { x: number; y: number }).x * clampedProgress,
            y: element.y + (value as { x: number; y: number }).y * clampedProgress,
          };
        case 'rotate':
          return {
            ...element,
            angle: (element.angle || 0) + (value as number) * clampedProgress,
          };
        case 'scale':
          const scale = 1 + ((value as number) - 1) * clampedProgress;
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
        const newElements = elements.map(element => {
          const animation = animations[element.id];
          if (animation) {
            const animationProgress = (currentTime - animation.delay) / animation.duration;
            if (animationProgress >= 0 && animationProgress <= 1) {
              return applyAnimation(element, animation, animationProgress);
            } else if (animation.isLoop) {
              const loopedProgress = animationProgress % 1;
              return applyAnimation(element, animation, loopedProgress);
            }
          }
          return element;
        });
        excalidrawAPI.updateScene({ elements: newElements });

        // Request next animation frame if any animation is still active
        if (Object.values(animations).some(animation => 
          animation.isLoop || currentTime < animation.delay + animation.duration
        )) {
          animationFrameRef.current = requestAnimationFrame(updateScene);
        }
      }
    }, [isAnimating, currentTime, excalidrawAPI, elements, animations]);

    useEffect(() => {
      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(updateScene);
      } else if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isAnimating, updateScene]);

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

export default ExcalidrawWrapper;