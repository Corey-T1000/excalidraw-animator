import React, { useRef, useState } from 'react'
import ExcalidrawWrapper from '../../src/components/ExcalidrawWrapper'
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIChatHistory() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleExport = () => {
    if (excalidrawRef.current) {
      const exportedElements = excalidrawRef.current.getSceneElements()
      console.log('Exported elements:', exportedElements)
      // Here you would typically send these elements to your animation logic
    }
  }

  const handlePreview = () => {
    setIsAnimating(true);
    if (excalidrawRef.current && 'animateElements' in excalidrawRef.current) {
      (excalidrawRef.current as any).animateElements(5000); // 5 seconds animation
    }
    setTimeout(() => setIsAnimating(false), 5000); // Stop after 5 seconds
  }

  return (
    <div className="relative w-full h-full">
      <ExcalidrawWrapper
        ref={excalidrawRef}
        elements={[]} // Pass an empty array or your actual elements
        onElementsChange={() => {}} // Add an empty handler or your actual handler
        animations={{}} // Pass an empty object or your actual animations
        isAnimating={isAnimating}
        onElementSelect={() => {}} // Add this line
        currentTime={0} // Pass 0 or your actual current time
      />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Export
        </button>
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Preview
        </button>
      </div>
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="text-white text-2xl">Animating...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}