import { useState, useMemo, useCallback } from 'react';
import { Search, Plus, FileUp, Home, FolderPlus, Hash, Settings, PenSquare, Menu } from 'lucide-react';
import { Note, Folder as FolderType } from '@/types';
import FileUploader from './FileUploader';
import { DragDropProvider } from '@/lib/DragDropContext';
import DraggableFolder from '../DraggableFolder';
import DraggableNote from '../DraggableNote';
import { v4 as uuidv4 } from 'uuid';

interface TagSectionProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

// Tag section component for displaying and filtering by tags
const TagSection = ({ allTags, selectedTags, onTagSelect }: TagSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div>
      <div 
        className="flex items-center px-4 py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg> : 
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        }
        <Hash className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Tags</span>
      </div>
      
      {isExpanded && (
        <div className="px-4 py-1">
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <span 
                  key={tag} 
                  className={`inline-block text-xs px-2 py-1 rounded-md cursor-pointer mb-1 ${
                    selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">No tags yet</div>
          )}
        </div>
      )}
    </div>
  );
};

interface DraggableNoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onCreateNote: (folderPath?: string) => void;
  onImportDocument: (text: string, title: string, folderPath?: string) => void;
  onOpenSettings: () => void;
  onMoveItem: (sourceId: string, sourcePath: string, targetPath: string, itemType: 'FOLDER' | 'NOTE') => void;
  onAddFolder: (name: string, parentPath: string) => void;
  onDeleteFolder: (folderPath: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function DraggableNoteList({ 
  notes, 
  activeNoteId, 
  onNoteSelect, 
  onCreateNote,
  onImportDocument,
  onOpenSettings,
  onMoveItem,
  onAddFolder,
  onDeleteFolder,
  onDeleteNote
}: DraggableNoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [view, setView] = useState<'home' | 'folders' | 'search'>('home');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [notes]);
  
  // Create a proper folder structure from note paths
  const folders = useMemo(() => {
    // Extract unique folder paths from notes
    const uniquePaths = new Set<string>();
    
    // First add all folder paths from notes
    notes.forEach(note => {
      if (note.folderPath) {
        uniquePaths.add(note.folderPath);
        
        // Add all parent paths as well to ensure the complete hierarchy
        let path = note.folderPath;
        while (path.lastIndexOf('/') > 0) {
          path = path.substring(0, path.lastIndexOf('/'));
          uniquePaths.add(path);
        }
      }
    });
    
    // Always ensure the root path exists
    uniquePaths.add('/');
    
    // Create folder objects
    const folderMap: Record<string, FolderType> = {};
    
    // First create all folder objects
    Array.from(uniquePaths).forEach(path => {
      // For the root path, use 'My Notes' as the name
      // For other paths, use the last segment of the path
      const name = path === '/' ? 'My Notes' : path.substring(path.lastIndexOf('/') + 1);
      
      // Determine the parent path
      // The parent of the root is null
      // For other paths, it's everything up to the last slash, or '/' if at the top level
      let parentPath: string | null = null;
      if (path !== '/') {
        const lastSlashIndex = path.lastIndexOf('/');
        if (lastSlashIndex === 0) {
          // Direct child of root
          parentPath = '/';
        } else {
          // Child of another folder
          parentPath = path.substring(0, lastSlashIndex);
        }
      }
      
      // Create the folder object
      folderMap[path] = {
        id: path,
        name,
        path,
        parentId: parentPath,
        children: [],
        order: 0, // Default order
        isExpanded: expandedFolders.has(path)
      };
    });
    
    // Then build the hierarchy by assigning children to their parents
    Object.values(folderMap).forEach((folder: FolderType) => {
      if (folder.parentId !== null && folderMap[folder.parentId]) {
        // Add this folder as a child to its parent
        folderMap[folder.parentId].children.push(folder);
        
        // Sort children alphabetically
        folderMap[folder.parentId].children.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    
    // Return just the root folder which contains the entire hierarchy
    return folderMap['/'] ? [folderMap['/']] : [];
  }, [notes, expandedFolders]);
  
  // Filter notes based on search query and selected tags
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }
    
    // Filter by active folder
    if (view === 'folders' && activeFolder) {
      filtered = filtered.filter(note => {
        // Root folder case - only show notes with no folderPath
        if (activeFolder === '/' && !note.folderPath) {
          return true;
        }
        
        // For other folders, only show notes that are directly in this folder
        if (note.folderPath === activeFolder) {
          // Make sure this is not a subfolder by checking the path parts
          const folderPathParts = activeFolder.split('/').filter(Boolean);
          const notePathParts = note.folderPath.split('/').filter(Boolean);
          
          // If the note is in this folder (not a subfolder), the path parts count would be equal
          return folderPathParts.length === notePathParts.length;
        }
        
        return false;
      });
    }
    
    return filtered;
  }, [notes, searchQuery, selectedTags, view, activeFolder]);
  
  // Toggle folder expand/collapse
  const handleFolderToggle = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);
  
  // Select a folder
  const handleFolderSelect = useCallback((folderId: string) => {
    setActiveFolder(folderId);
    setView('folders');
  }, []);
  
  // Toggle tag selection
  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);
  
  // Handle text extraction from uploaded files
  const handleTextExtracted = (text: string, filename: string) => {
    // Extract title from filename (remove extension)
    const title = filename.split('.').slice(0, -1).join('.');
    // Pass the active folder path to onImportDocument
    onImportDocument(text, title, activeFolder || '/');
  };
  
  // Handle creating a new folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    
    const parentPath = activeFolder || '/';
    // Create the new folder
    onAddFolder(newFolderName, parentPath);
    
    // Reset form
    setNewFolderName('');
    setIsAddingFolder(false);
  };
  
  return (
    <DragDropProvider onMoveItem={onMoveItem}>
      <div className={`border-r border-gray-200 bg-gray-50 flex flex-col h-screen text-gray-800 ${isSidebarCollapsed ? 'w-[56px]' : 'w-72'} transition-[width] duration-300 ease-in-out overflow-hidden`}>
        {/* Header with logo and toggle - fixed */}
        <div className="p-2 border-b border-gray-200 bg-white shadow-sm flex items-center flex-shrink-0 relative">
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="ml-2 p-1 rounded-md hover:bg-gray-100 text-gray-600 z-10"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className={`text-xl font-bold text-blue-800 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150 ${isSidebarCollapsed ? 'delay-0' : 'delay-150'} pointer-events-none`}>
              Notes Organizer
            </h1>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className={`flex-1 ${isSidebarCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Main navigation */}
          <div className="p-2 space-y-1 bg-gray-50">
            <button 
              className={`flex items-center py-2 px-3 rounded-md ${isSidebarCollapsed ? '' : 'w-full'} ${view === 'home' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
              onClick={() => setView('home')}
              title="Home"
            >
              <Home className="h-4 w-4" />
              <div className={`overflow-hidden ${isSidebarCollapsed ? 'w-0' : 'ml-3'}`}>
                <span className={`font-medium whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150 ${isSidebarCollapsed ? 'delay-0' : 'delay-150'}`}>
                  Home
                </span>
              </div>
            </button>
            
            <button 
              className={`flex items-center py-2 px-3 rounded-md ${isSidebarCollapsed ? '' : 'w-full'} ${view === 'search' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
              onClick={() => setView('search')}
              title="Search"
            >
              <Search className="h-4 w-4" />
              <div className={`overflow-hidden ${isSidebarCollapsed ? 'w-0' : 'ml-3'}`}>
                <span className={`font-medium whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150 ${isSidebarCollapsed ? 'delay-0' : 'delay-150'}`}>
                  Search
                </span>
              </div>
            </button>
          </div>
          
          {/* Rest of the sidebar content */}
          <div className={`${isSidebarCollapsed ? 'opacity-0 invisible absolute' : 'opacity-100 visible relative'} transition-opacity duration-150 ${isSidebarCollapsed ? 'delay-0' : 'delay-150'}`}>
            {/* Search input (visible when search is active) */}
            {view === 'search' && (
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    className="w-full py-2 pl-9 pr-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Folder structure section */}
            <div className="p-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold px-2">Folders</h2>
                <div className="flex space-x-1">
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
                    aria-label="Add new folder"
                    title="Add new folder"
                    onClick={() => setIsAddingFolder(true)}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
                    onClick={() => setIsFileUploaderOpen(true)}
                    aria-label="Import document"
                    title="Import document"
                  >
                    <FileUp className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
                    onClick={() => onCreateNote(activeFolder || '/')}
                    aria-label="Create new note"
                    title="Create new note"
                  >
                    <PenSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {isAddingFolder && (
                <div className="p-2 mb-2 bg-gray-100 rounded-md">
                  <input
                    type="text"
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                      onClick={() => {
                        setIsAddingFolder(false);
                        setNewFolderName('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      onClick={handleAddFolder}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                {folders.map(folder => (
                  <DraggableFolder
                    key={folder.id}
                    folder={folder}
                    level={0}
                    activeFolder={activeFolder}
                    onFolderSelect={handleFolderSelect}
                    onFolderToggle={handleFolderToggle}
                    expandedFolders={expandedFolders}
                    notes={notes}
                    activeNoteId={activeNoteId}
                    onNoteSelect={onNoteSelect}
                  />
                ))}
              </div>
            </div>
            
            {/* Tags section */}
            <div className="p-2 border-t border-gray-200">
              <TagSection 
                allTags={allTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
              />
            </div>
            
            {/* Notes section (visible when home or search is active) */}
            {(view === 'home' || (view === 'search' && searchQuery)) && (
              <div className="border-t border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-sm font-semibold">Notes</h2>
                </div>
                <div>
                  {filteredNotes.map(note => (
                    <DraggableNote
                      key={note.id}
                      note={note}
                      isActive={note.id === activeNoteId}
                      onClick={() => onNoteSelect(note)}
                    />
                  ))}
                  {filteredNotes.length === 0 && (
                    <div className="p-4 text-center text-gray-500 italic">
                      No notes found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-2 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <button 
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-200 text-gray-700"
              aria-label="Settings"
              title="Settings"
              onClick={onOpenSettings}
            >
              <Settings className="h-4 w-4" />
            </button>
            
            <div className={`overflow-hidden ${isSidebarCollapsed ? 'w-0' : 'w-auto'} transition-[width] duration-300`}>
              <button 
                className={`flex items-center py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150 ${isSidebarCollapsed ? 'delay-0' : 'delay-150'}`}
                onClick={() => onCreateNote(activeFolder || '/')}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>New Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Uploader Modal */}
        <FileUploader 
          isOpen={isFileUploaderOpen}
          onClose={() => setIsFileUploaderOpen(false)}
          onTextExtracted={handleTextExtracted}
        />
      </div>
    </DragDropProvider>
  );
} 