import React, { forwardRef, useImperativeHandle } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

interface ExcalidrawWrapperProps {
  // Add any props you need to pass to Excalidraw
}

const ExcalidrawWrapper = forwardRef<ExcalidrawImperativeAPI, ExcalidrawWrapperProps>((props, ref) => {
  const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

  useImperativeHandle(ref, () => excalidrawAPI as ExcalidrawImperativeAPI, [excalidrawAPI]);

  return (
    <Excalidraw
      {...props}
      excalidrawAPI={(api) => {
        setExcalidrawAPI(api);
        if (typeof ref === 'function') {
          ref(api);
        } else if (ref) {
          ref.current = api;
        }
      }}
    />
  );
});

export default ExcalidrawWrapper;