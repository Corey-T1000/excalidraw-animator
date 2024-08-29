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
    <table className="w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {elements.map((element) => (
          <tr 
            key={element.id} 
            onClick={() => onElementSelect(element)}
            className={selectedElementId === element.id ? 'bg-blue-100' : ''}
          >
            <td>
              <input
                value={selectedElementId === element.id ? editingName : elementNames[element.id]}
                onChange={handleNameChange}
                onBlur={() => handleNameBlur(element.id)}
                disabled={selectedElementId !== element.id}
                className={selectedElementId === element.id ? 'border border-blue-500' : 'border-none bg-transparent'}
              />
            </td>
            <td>{element.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ElementTable;