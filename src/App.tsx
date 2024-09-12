import React, { useState, useRef, useCallback, useEffect } from 'react';
import ExcalidrawWrapper from './components/ExcalidrawWrapper';
import AnimationEditor from './components/AnimationEditor';
import { StartScreen } from './components/StartScreen';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Menu } from './components/Icons';
import './styles/StartScreen.css';
import { Animation } from './types/Animation';
import Timeline from './components/Timeline';

const App: React.FC = () => {
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const [selectedElement, setSelectedElement] = useState<ExcalidrawElement | null>(null);
  const [isStartScreen, setIsStartScreen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(5000); // Default 5 seconds
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

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

  const handleElementsChange = useCallback((newElements: readonly ExcalidrawElement[], deletedElementIds: string[] = []) => {
    setElements(prevElements => {
      if (JSON.stringify(prevElements) !== JSON.stringify(newElements)) {
        return newElements as ExcalidrawElement[];
      }
      return prevElements;
    });

    // Remove animations for deleted elements
    if (deletedElementIds.length > 0) {
      setAnimations(prevAnimations => {
        const updatedAnimations = { ...prevAnimations };
        deletedElementIds.forEach(id => {
          delete updatedAnimations[id];
        });
        return updatedAnimations;
      });

      // Update total duration
      setTotalDuration(prevDuration => {
        const remainingAnimations = Object.entries(animations)
          .filter(([id]) => !deletedElementIds.includes(id))
          .map(([, anim]) => anim);
        return Math.max(
          ...remainingAnimations.map(anim => (anim?.delay ?? 0) + (anim?.duration ?? 0)),
          0
        );
      });

      // Deselect the element if it was deleted
      if (selectedElement && deletedElementIds.includes(selectedElement.id)) {
        setSelectedElement(null);
      }
    }
  }, [animations, selectedElement]);

  const handleAnimationUpdate = useCallback((elementId: string, animation: Animation | null) => {
    setAnimations(prev => {
      if (animation === null) {
        const { [elementId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [elementId]: animation
      };
    });

    // Update total duration
    setTotalDuration(prevDuration => {
      const allAnimations = { ...animations, [elementId]: animation };
      return Math.max(
        ...Object.values(allAnimations).map(anim => (anim?.delay ?? 0) + (anim?.duration ?? 0)),
        prevDuration
      );
    });
  }, [animations]);

  const handleStartAnimation = useCallback(() => {
    setIsResetting(true);
    setCurrentTime(0);
    setIsAnimating(true);
    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsedTime = time - startTime;
      if (elapsedTime < totalDuration) {
        setCurrentTime(elapsedTime);
        setIsResetting(false); // Set isResetting to false after the first frame
        animationFrameRef.current = requestAnimationFrame(animate);
      } else if (isLooping) {
        setCurrentTime(0);
        setIsResetting(true);
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrentTime(totalDuration);
      }
    };
    requestAnimationFrame(animate);
  }, [totalDuration, isLooping]);

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

  const handleElementSelect = useCallback((elementId: string | null) => {
    if (elementId) {
      const element = elements.find(el => el.id === elementId);
      setSelectedElement(element || null);
    } else {
      setSelectedElement(null);
    }
  }, [elements]);

  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
  }, []);

  const handleLoopToggle = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const handleDurationChange = useCallback((newDuration: number) => {
    setTotalDuration(newDuration);
    // Optionally, adjust animations if they exceed the new duration
    setAnimations(prevAnimations => {
      const updatedAnimations = { ...prevAnimations };
      Object.entries(updatedAnimations).forEach(([id, anim]) => {
        if (anim.delay + anim.duration > newDuration) {
          updatedAnimations[id] = {
            ...anim,
            duration: Math.max(0, newDuration - anim.delay)
          };
        }
      });
      return updatedAnimations;
    });
  }, []);

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
                onElementsDeleted={(deletedElementIds) => handleElementsChange(elements, deletedElementIds)}
                animations={animations}
                isAnimating={isAnimating}
                onElementSelect={handleElementSelect}
                currentTime={currentTime}
                totalDuration={totalDuration}
                isResetting={isResetting}
              />
            </div>
            <div className={`w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-300 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0`}>
              <div className="flex-1 overflow-y-auto">
                {selectedElement && (
                  <AnimationEditor
                    selectedElement={selectedElement}
                    animation={selectedElement ? animations[selectedElement.id] : null}
                    onAnimationUpdate={handleAnimationUpdate}
                    onAddToTimeline={handleAddToTimeline}
                  />
                )}
              </div>
            </div>
          </div>
          <Timeline
            elements={elements}
            animations={animations}
            onSelectElement={handleElementSelect}
            selectedElementId={selectedElement?.id || null}
            duration={totalDuration}
            currentTime={currentTime}
            onTimeChange={handleTimeChange}
            onAnimationUpdate={handleAnimationUpdate}
            onStartAnimation={handleStartAnimation}
            isLooping={isLooping}
            onLoopToggle={handleLoopToggle}
            onDurationChange={handleDurationChange}
            key={Object.keys(animations).length}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(App);