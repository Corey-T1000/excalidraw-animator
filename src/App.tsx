import React, { useState, useRef, useCallback, useEffect } from 'react';
import ExcalidrawWrapper from './components/ExcalidrawWrapper';
import AnimationEditor from './components/AnimationEditor';
import ElementTable from './components/ElementTable';
import { StartScreen } from './components/StartScreen';
import GlobalTimeline from './components/GlobalTimeline';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Download } from 'lucide-react';
import { Menu } from './components/Icons';
import './styles/StartScreen.css';
import { Animation } from './types/Animation';

const App: React.FC = () => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
  const [isStartScreen, setIsStartScreen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0); // Default 0
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);

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
    setElements(prevElements => {
      if (JSON.stringify(prevElements) !== JSON.stringify(newElements)) {
        return newElements as ExcalidrawElement[];
      }
      return prevElements;
    });
  }, []);

  const handleAnimationUpdate = useCallback((elementId: string, animation: Animation | null) => {
    setAnimations(prev => {
      if (animation === null) {
        const newAnimations = { ...prev };
        delete newAnimations[elementId];
        return newAnimations;
      }
      return {
        ...prev,
        [elementId]: animation
      };
    });

    // Update total duration if necessary
    setTotalDuration(prevDuration => {
      if (animation) {
        return Math.max(prevDuration, animation.delay + animation.duration);
      }
      return prevDuration;
    });
  }, []);

  const handleElementRename = useCallback((elementId: string, newName: string) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(el => el.id === elementId);
      if (elementIndex === -1) return prevElements;

      const element = prevElements[elementIndex];
      
      // Use the new name if provided, otherwise keep the existing name or generate a new one
      const finalName = newName.trim() || element.customData?.name || `${element.type}-${prevElements.filter(el => el.type === element.type).length}`;

      const updatedElement = {
        ...element,
        customData: { ...element.customData, name: finalName }
      };

      const newElements = [...prevElements];
      newElements[elementIndex] = updatedElement;

      // Update the Excalidraw scene
      if (excalidrawRef.current) {
        excalidrawRef.current.updateScene({
          elements: newElements
        });
      }

      return newElements;
    });
    
    // Update selectedElement if it's the renamed element
    setSelectedElement(prev => 
      prev && prev.id === elementId 
        ? { ...prev, customData: { ...prev.customData, name: newName.trim() || prev.customData?.name || `${prev.type}-${elements.filter(el => el.type === prev.type).length}` } }
        : prev
    );

    // Update the Excalidraw scene
    if (excalidrawRef.current) {
      excalidrawRef.current.updateScene({
        elements: elements.map(el => 
          el.id === elementId 
            ? { ...el, customData: { ...el.customData, name: newName.trim() || `${el.type}-${elements.filter(e => e.type === el.type).length}` } }
            : el
        )
      });
    }
  }, [elements]);

  const handleStartAnimation = useCallback(() => {
    setIsAnimating(true);
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsedTime = time - startTime;
      if (elapsedTime < totalDuration) {
        setCurrentTime(elapsedTime);
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentTime(totalDuration);
      }
    };
    requestAnimationFrame(animate);
  }, [totalDuration]);

  const handleAddToTimeline = useCallback((elementId: string, animation: Animation) => {
    // Here you can add any additional logic needed for adding to the timeline
    // For now, we'll just update the totalDuration
    setTotalDuration(prev => Math.max(prev, animation.delay + animation.duration));
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (excalidrawRef.current && selectedElement) {
      excalidrawRef.current.updateScene({
        appState: {
          selectedElementIds: { [selectedElement.id]: true }
        }
      });
    }
  }, [selectedElement]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Your touch start logic here
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const handleElementSelect = useCallback((element: ExcalidrawElement | null) => {
    setSelectedElement(prev => prev?.id === element?.id ? prev : element);
  }, []);

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

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
      animations: animations, // Include animations in the exported file
    };

    const blob = new Blob([JSON.stringify(exportObject)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animated_excalidraw.excalidraw';
    link.click();
    URL.revokeObjectURL(url);
  }, [elements, animations]);

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5]">
      {isStartScreen ? (
        <StartScreen onFileUpload={handleFileUpload} onCreateNew={handleCreateNew} />
      ) : (
        <>
          <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Excalidraw Animator</h1>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
          </header>
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ExcalidrawWrapper
                ref={excalidrawRef}
                elements={elements}
                onElementsChange={handleElementsChange}
                animations={animations}
                isAnimating={isAnimating}
                onElementSelect={handleElementSelect}
                currentTime={currentTime}
              />
            </div>
            <div className={`w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-300 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0`}>
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
                    onAddToTimeline={handleAddToTimeline}
                  />
                )}
              </div>
              {/* Remove the separate "Add to Timeline" button */}
            </div>
          </div>
          <GlobalTimeline
            duration={totalDuration}
            currentTime={currentTime}
            onTimeChange={handleTimeChange}
            animations={animations}
            elements={elements}
            onAnimationUpdate={handleAnimationUpdate}
            onStartAnimation={handleStartAnimation}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(App);