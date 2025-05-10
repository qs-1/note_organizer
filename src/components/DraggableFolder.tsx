import React, { useState, useRef } from 'react';
import { Folder, Note } from '@/types';
import { useDragDrop } from '@/lib/DragDropContext';
import { ChevronDown, ChevronRight, Folder as FolderIcon, Trash2 } from 'lucide-react';

interface DraggableFolderProps {
  folder: Folder;
  level: number;
  activeFolder: string | null;
  onFolderSelect: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  expandedFolders: Set<string>;
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onDeleteFolder: (folderPath: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const DraggableFolder: React.FC<DraggableFolderProps> = ({
  folder,
  level,
  activeFolder,
  onFolderSelect,
  onFolderToggle,
  expandedFolders,
  notes,
  activeNoteId,
  onNoteSelect,
  onDeleteFolder,
  onDeleteNote
}) => {
  const { draggedItem, setDraggedItem, handleDrop: contextHandleDrop, isDragging } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = expandedFolders.has(folder.id);
  const isActive = activeFolder === folder.id;
  
  // Filter notes that are directly in this folder
  const folderNotes = notes.filter(note => {
    // Root folder case - only show notes with no folderPath
    if (folder.path === '/') {
      return !note.folderPath;
    }
    
    // For other folders, only show notes that are directly in this folder
    // This ensures notes in subfolders aren't shown in the parent folder
    if (note.folderPath === folder.path) {
      // Make sure the note isn't in a subfolder by checking there are no additional slashes
      // after the folder path in the note's folderPath
      const folderPathParts = folder.path.split('/').filter(Boolean);
      const notePathParts = note.folderPath.split('/').filter(Boolean);
      
      // If the note is in this folder (not a subfolder), the path parts count would be equal
      return folderPathParts.length === notePathParts.length;
    }
    
    return false;
  });
  
  // Check if folder has either subfolders OR notes
  const hasChildren = (folder.children && folder.children.length > 0);
  const hasNotes = folderNotes.length > 0;
  // A folder should be expandable if it has either children folders or notes
  const isExpandable = hasChildren || hasNotes;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderToggle(folder.id);
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedItem({
      type: 'FOLDER',
      id: folder.id,
      path: folder.path
    });
    
    // Set ghost drag image
    if (folderRef.current) {
      const rect = folderRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(folderRef.current, e.clientX - rect.left, e.clientY - rect.top);
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
  
  const handleFolderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    contextHandleDrop(folder.path, 'FOLDER');
  };
  
  const handleDragEnd = () => {
    if (!isDragging) return;
    setDraggedItem(null);
  };
  
  const isDragged = draggedItem?.id === folder.id && draggedItem?.type === 'FOLDER';
  
  // Add this function to handle folder deletion with a try/catch
  const handleDeleteFolderClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    try {
      onDeleteFolder(path);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // Add this function to handle note deletion with a try/catch
  const handleDeleteNoteClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    try {
      onDeleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  return (
    <div className="text-gray-800">
      <div 
        ref={folderRef}
        className={`group flex items-center py-1 px-2 rounded-md cursor-pointer ${isActive ? 'bg-blue-100' : 'hover:bg-gray-200'} ${isOver ? 'bg-blue-50' : ''} ${isDragged ? 'opacity-50' : ''}`}
        onClick={() => onFolderSelect(folder.id)}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFolderDrop}
        onDragEnd={handleDragEnd}
      >
        <span onClick={handleToggle} className="mr-1">
          {isExpandable ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="w-4" />
          )}
        </span>
        <FolderIcon className="h-4 w-4 mr-2 text-gray-500" />
        <span className="text-sm truncate flex-grow">{folder.name}</span>
        
        {/* Add delete folder button */}
        {folder.path !== '/' && (
          <button 
            className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-auto flex-shrink-0"
            onClick={(e) => handleDeleteFolderClick(e, folder.path)}
            title="Delete folder"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div>
          {/* Render sub-folders */}
          {hasChildren && folder.children.map(childFolder => (
            <DraggableFolder
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              activeFolder={activeFolder}
              onFolderSelect={onFolderSelect}
              onFolderToggle={onFolderToggle}
              expandedFolders={expandedFolders}
              notes={notes}
              activeNoteId={activeNoteId}
              onNoteSelect={onNoteSelect}
              onDeleteFolder={onDeleteFolder}
              onDeleteNote={onDeleteNote}
            />
          ))}
          
          {/* Render notes in this folder */}
          {hasNotes && folderNotes.map(note => (
            <div 
              key={note.id}
              className="group flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => onNoteSelect(note)}
              style={{ paddingLeft: `${(level * 12) + 36}px` }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDraggedItem({
                  type: 'NOTE',
                  id: note.id,
                  path: note.folderPath || '/'
                });
              }}
              onDragEnd={() => {
                if (isDragging) setDraggedItem(null);
              }}
            >
              <span className="h-4 w-4 mr-2 text-gray-500">📄</span>
              <span className="text-sm truncate flex-grow">{note.title}</span>
              
              {/* Add delete note button */}
              <button 
                className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-auto flex-shrink-0"
                onClick={(e) => handleDeleteNoteClick(e, note.id)}
                title="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraggableFolder; 