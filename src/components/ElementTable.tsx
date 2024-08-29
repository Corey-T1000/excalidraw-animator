import React, { useState, useCallback } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

interface ElementTableProps {
  elements: ExcalidrawElement[];
  onElementRename: (elementId: string, newName: string) => void;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  selectedElementId: string | null;
}

const ElementTable: React.FC<ElementTableProps> = ({
  elements,
  onElementRename,
  onElementSelect,
  selectedElementId,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleRenameStart = useCallback((element: ExcalidrawElement) => {
    setEditingId(element.id);
    setEditingName(element.customData?.name || element.id);
  }, []);

  const handleRenameConfirm = useCallback(() => {
    if (editingId && editingName.trim() !== '') {
      onElementRename(editingId, editingName.trim());
      setEditingId(null);
    }
  }, [editingId, editingName, onElementRename]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameConfirm();
    }
  }, [handleRenameConfirm]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Elements</h2>
      <ul className="space-y-2">
        {elements.map((element) => (
          <li
            key={element.id}
            className={`p-2 rounded-md cursor-pointer ${
              selectedElementId === element.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => onElementSelect(element)}
          >
            {editingId === element.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyPress={handleKeyPress}
                autoFocus
                className="w-full p-1 border border-gray-300 rounded-md"
              />
            ) : (
              <div className="flex justify-between items-center">
                <span>{element.customData?.name || element.id}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(element);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Rename
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(ElementTable);