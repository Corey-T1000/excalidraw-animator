import React, { useState, useEffect, useMemo } from 'react';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

interface ElementTableProps {
  elements: ExcalidrawElement[];
  onElementRename: (id: string, newName: string) => void;
  onElementSelect: (element: ExcalidrawElement | null) => void;
  selectedElementId: string | null;
}

const ElementTable: React.FC<ElementTableProps> = ({ 
  elements, 
  onElementRename, 
  onElementSelect, 
  selectedElementId 
}) => {
  const [editingName, setEditingName] = useState<string>('');

  // Generate default names
  const elementNames = useMemo(() => {
    const names: Record<string, string> = {};
    const counts: Record<string, number> = {};
    elements.forEach(element => {
      if (element.customData?.name) {
        names[element.id] = element.customData.name;
      } else {
        counts[element.type] = (counts[element.type] || 0) + 1;
        names[element.id] = `${element.type}-${counts[element.type]}`;
      }
    });
    return names;
  }, [elements]);

  useEffect(() => {
    if (selectedElementId) {
      setEditingName(elementNames[selectedElementId] || '');
    }
  }, [selectedElementId, elementNames]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = (id: string) => {
    onElementRename(id, editingName);
  };

  return (
    <div className="flex flex-col min-h-[30%] max-h-[50%]">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="text-lg font-semibold">Elements</h3>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((element) => (
              <tr 
                key={element.id}
                onClick={() => onElementSelect(element)}
                className={`cursor-pointer transition-colors duration-200 ${
                  selectedElementId === element.id 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <td className="p-2">
                  <input
                    value={selectedElementId === element.id ? editingName : elementNames[element.id]}
                    onChange={handleNameChange}
                    onBlur={() => handleNameBlur(element.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={selectedElementId !== element.id}
                    className={`w-full bg-transparent border-none focus:outline-none ${
                      selectedElementId === element.id ? 'text-white' : 'text-gray-700'
                    }`}
                  />
                </td>
                <td className="p-2 text-sm">
                  {element.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ElementTable;