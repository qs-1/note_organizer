import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Note, Folder } from '@/types';

type DragItem = {
  type: 'FOLDER' | 'NOTE';
  id: string;
  path: string;
};

interface DragDropContextType {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  handleDrop: (targetPath: string, targetType: 'FOLDER' | 'NOTE') => void;
  isDragging: boolean;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

interface DragDropProviderProps {
  children: ReactNode;
  onMoveItem: (sourceId: string, sourcePath: string, targetPath: string, itemType: 'FOLDER' | 'NOTE') => void;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children, onMoveItem }) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  
  const handleDrop = (targetPath: string, targetType: 'FOLDER' | 'NOTE') => {
    if (!draggedItem) return;
    
    // Don't allow dropping on itself
    if (draggedItem.path === targetPath) return;
    
    // Don't allow dropping a folder into its own child folder
    if (draggedItem.type === 'FOLDER' && targetPath.startsWith(draggedItem.path + '/')) return;
    
    // Handle the drop operation
    onMoveItem(draggedItem.id, draggedItem.path, targetPath, draggedItem.type);
    setDraggedItem(null);
  };
  
  return (
    <DragDropContext.Provider 
      value={{ 
        draggedItem, 
        setDraggedItem, 
        handleDrop, 
        isDragging: draggedItem !== null 
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}; 