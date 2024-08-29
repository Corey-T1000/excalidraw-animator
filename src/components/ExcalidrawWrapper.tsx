import React, { forwardRef, useImperativeHandle } from 'react';
import { Excalidraw, THEME } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState } from "@excalidraw/excalidraw/types/types";

interface ExcalidrawWrapperProps extends Partial<ExcalidrawProps> {
  elements: readonly ExcalidrawElement[];
  onElementsChange?: (elements: readonly ExcalidrawElement[]) => void;
  onElementSelect?: (element: ExcalidrawElement | null) => void;
  animations?: Record<string, any>; // Replace 'any' with your Animation type
  isAnimating?: boolean;
  currentTime?: number;
}

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>(
  ({ elements, onElementsChange, onElementSelect, animations, isAnimating, currentTime, ...props }, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

    useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

    const onChange = (elements: readonly ExcalidrawElement[], appState: AppState) => {
      if (onElementsChange) {
        onElementsChange(elements);
      }
      if (onElementSelect && appState.selectedElementIds) {
        const selectedElement = elements.find(el => appState.selectedElementIds[el.id]);
        onElementSelect(selectedElement || null);
      }
    };

    return (
      <Excalidraw
        initialData={{ elements }}
        onChange={onChange}
        theme={THEME.LIGHT}
        UIOptions={{ canvasActions: { export: false, saveAsImage: false } }}
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api);
          if (typeof ref === 'function') {
            ref(api);
          } else if (ref) {
            ref.current = api;
          }
        }}
        {...props}
      />
    );
  }
);

export default ExcalidrawWrapper;