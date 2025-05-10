import React, { useRef, useState } from 'react';
import { Note } from '@/types';
import { useDragDrop } from '@/lib/DragDropContext';
import { File, Trash2 } from 'lucide-react';

interface DraggableNoteProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  level?: number;
  onDeleteNote?: (noteId: string) => void;
}

const DraggableNote: React.FC<DraggableNoteProps> = ({ 
  note, 
  isActive, 
  onClick,
  level = 0,
  onDeleteNote
}) => {
  const { draggedItem, setDraggedItem, handleDrop: contextHandleDrop, isDragging } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedItem({
      type: 'NOTE',
      id: note.id,
      path: note.folderPath || '/'
    });
    
    // Set ghost drag image
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(noteRef.current, e.clientX - rect.left, e.clientY - rect.top);
    }
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOver) setIsOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleNoteDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    
    if (draggedItem?.id === note.id) return; // Don't allow dropping on self
    
    // When dropping on a note, we want to move to the same folder as that note
    contextHandleDrop(note.folderPath || '/', 'NOTE');
  };

  const handleDragEnd = () => {
    if (isDragging) setDraggedItem(null);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteNote) {
      try {
        onDeleteNote(note.id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const isDragged = draggedItem?.id === note.id && draggedItem?.type === 'NOTE';
  
  return (
    <div 
      ref={noteRef}
      className={`group p-3 border-b border-gray-200 cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'} ${isOver ? 'bg-blue-50' : ''} ${isDragged ? 'opacity-50' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleNoteDrop}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center overflow-hidden">
          <File className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
          <h3 className="font-medium text-gray-800 truncate">
            {note.title}
          </h3>
        </div>
        <div className="flex items-center">
          {onDeleteNote && (
            <button 
              className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity mr-2 flex-shrink-0"
              onClick={handleDeleteClick}
              title="Delete note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(note.updatedAt)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2 ml-6">
        {note.content}
      </p>
      {note.tags.length > 0 && (
        <div className="mt-2 ml-6 flex flex-wrap">
          {note.tags.map(tag => (
            <span key={tag} className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md mr-1 mb-1">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraggableNote; 