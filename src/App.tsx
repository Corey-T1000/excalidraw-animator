import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExcalidrawRenderer from './components/ExcalidrawRenderer';
import AnimationEditor from './components/AnimationEditor';
import ElementTable from './components/ElementTable';
import StartScreen from './components/StartScreen';
import GlobalTimeline from './components/GlobalTimeline';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { Download } from 'lucide-react';

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

const App: React.FC = () => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
  const [isStartScreen, setIsStartScreen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(1000); // Default 1 second

  const excalidrawRef = useRef<any>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    const content = await file.text();
    const parsedContent = JSON.parse(content);
    setElements(parsedContent.elements);
    setIsStartScreen(false);
  }, []);

  const handleCreateNew = useCallback(() => {
    setElements([]);
    setAnimations({});
    setSelectedElement(null);
    setIsStartScreen(false);
  }, []);

  const handleElementsChange = useCallback((newElements: readonly ExcalidrawElement[]) => {
    setElements(newElements as ExcalidrawElement[]);
  }, []);

  const handleAnimationUpdate = useCallback((elementId: string, animation: Animation) => {
    console.log('Updating animation:', { elementId, animation });
    setAnimations(prev => {
      const newAnimations = { ...prev, [elementId]: animation };
      console.log('New animations state:', newAnimations);
      const maxDuration = Math.max(...Object.values(newAnimations).map(a => a.duration + a.delay));
      if (maxDuration > totalDuration) {
        setTotalDuration(maxDuration);
      }
      return newAnimations;
    });
  }, [totalDuration]);

  const handleElementRename = useCallback((elementId: string, newName: string) => {
    setElements(prevElements => 
      prevElements.map(el => 
        el.id === elementId 
          ? { ...el, customData: { ...el.customData, name: newName } }
          : el
      )
    );
    
    setAnimations(prevAnimations => {
      if (prevAnimations[elementId]) {
        const { [elementId]: oldAnimation, ...rest } = prevAnimations;
        return { ...rest, [elementId]: oldAnimation };
      }
      return prevAnimations;
    });

    // Update selectedElement if it's the renamed element
    setSelectedElement(prev => 
      prev && prev.id === elementId 
        ? { ...prev, customData: { ...prev.customData, name: newName } }
        : prev
    );
  }, []);

  const handleElementNameUpdate = useCallback((elementId: string, newName: string) => {
    setElements((prevElements) =>
      prevElements.map((element) =>
        element.id === elementId ? { ...element, customData: { ...element.customData, name: newName } } : element
      )
    );
  }, []);

  const animateElements = useCallback(() => {
    console.log('Starting animation with animations:', animations);
    setIsAnimating(true);
    const maxDuration = Math.max(...Object.values(animations).map(a => a.duration + a.delay));
    setTimeout(() => {
      setIsAnimating(false);
      console.log('Animation finished');
    }, maxDuration);
  }, [animations]);

  const exportAnimatedFile = useCallback(() => {
    const exportObject = {
      type: 'excalidraw',
      version: 2,
      source: 'https://excalidraw.com',
      elements: elements,
      appState: {
        viewBackgroundColor: '#ffffff',
        gridSize: null,
      },
    };

    const blob = new Blob([JSON.stringify(exportObject)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animated_excalidraw.excalidraw';
    link.click();
    URL.revokeObjectURL(url);
  }, [elements]);

  const handleElementSelect = useCallback((element: ExcalidrawElement | null) => {
    setSelectedElement(prev => prev?.id === element?.id ? prev : element);
  }, []);

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  useEffect(() => {
    if (excalidrawRef.current && selectedElement) {
      excalidrawRef.current.updateScene({
        appState: {
          selectedElementIds: { [selectedElement.id]: true }
        }
      });
    }
  }, [selectedElement]);

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5]">
      {isStartScreen ? (
        <StartScreen onFileUpload={handleFileUpload} onCreateNew={handleCreateNew} />
      ) : (
        <>
          <div className="flex flex-grow overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ExcalidrawRenderer 
                ref={excalidrawRef}
                elements={elements} 
                onElementsChange={handleElementsChange} 
                animations={animations}
                isAnimating={isAnimating}
                onElementSelect={handleElementSelect}
                currentTime={currentTime}
              />
            </div>
            <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <ElementTable
                  elements={elements}
                  onElementRename={handleElementRename}
                  onElementSelect={handleElementSelect}
                  selectedElementId={selectedElement?.id || null}
                />
                {selectedElement && (
                  <AnimationEditor
                    selectedElement={selectedElement}
                    onAnimationUpdate={handleAnimationUpdate}
                  />
                )}
              </div>
              <div className="p-4 border-t border-gray-300 flex items-center space-x-2">
                <button
                  onClick={animateElements}
                  className="flex-grow bg-[#6965db] text-white py-2 px-4 rounded-md hover:bg-[#5b57c2] transition duration-300"
                >
                  Animate
                </button>
                <button
                  onClick={exportAnimatedFile}
                  className="p-2 border border-[#6965db] text-[#6965db] rounded-md hover:bg-[#f0f0ff] transition duration-300"
                  title="Export Animated File"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
          <GlobalTimeline
            duration={totalDuration}
            currentTime={currentTime}
            onTimeChange={handleTimeChange}
            animations={animations}
            onAnimationUpdate={handleAnimationUpdate}
          />
        </>
      )}
    </div>
  );
};

export default App;