import { useState, useMemo, useCallback } from 'react';
import { Search, Plus, FileUp, Home, ChevronRight, ChevronDown, FolderPlus, Hash, Folder, File, Settings, PenSquare, Menu } from 'lucide-react';
import { Note, Folder as FolderType } from '@/types';
import FileUploader from './FileUploader';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

// Note item component for displaying individual notes
const NoteItem = ({ note, isActive, onClick }: NoteItemProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div 
      className={`p-3 border-b border-gray-200 cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center overflow-hidden">
          <File className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
          <h3 className="font-medium text-gray-800 truncate">
            {note.title}
          </h3>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatDate(note.updatedAt)}</span>
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

// Folder component for displaying folders in the sidebar
interface FolderItemProps {
  folder: FolderType;
  level: number;
  activeFolder: string | null;
  onFolderSelect: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  expandedFolders: Set<string>;
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (note: Note) => void;
}

const FolderItem = ({ 
  folder, 
  level, 
  activeFolder, 
  onFolderSelect, 
  onFolderToggle, 
  expandedFolders, 
  notes,
  activeNoteId,
  onNoteSelect 
}: FolderItemProps) => {
  const isExpanded = expandedFolders.has(folder.id);
  const isActive = activeFolder === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;
  
  // Filter notes that belong to this folder
  const folderNotes = notes.filter(note => {
    // Notes with no folderPath belong to the root folder
    if (!note.folderPath && folder.path === '/') {
      return true;
    }
    return note.folderPath === folder.path;
  });
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderToggle(folder.id);
  };
  
  return (
    <div className="text-gray-800">
      <div 
        className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${isActive ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
        onClick={() => onFolderSelect(folder.id)}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        <span onClick={handleToggle} className="mr-1">
          {hasChildren ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="w-4" />
          )}
        </span>
        <Folder className="h-4 w-4 mr-2 text-gray-500" />
        <span className="text-sm truncate">{folder.name}</span>
      </div>
      
      {isExpanded && (
        <div>
          {/* Render sub-folders */}
          {hasChildren && folder.children.map(childFolder => (
            <FolderItem
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
            />
          ))}
          
          {/* Render notes in this folder */}
          {folderNotes.length > 0 && folderNotes.map(note => (
            <div 
              key={note.id}
              className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${note.id === activeNoteId ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              onClick={() => onNoteSelect(note)}
              style={{ paddingLeft: `${(level * 12) + 36}px` }}
            >
              <File className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm truncate">{note.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Tag section component for displaying and filtering by tags
interface TagSectionProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagSection = ({ allTags, selectedTags, onTagSelect }: TagSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div>
      <div 
        className="flex items-center px-4 py-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
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

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onCreateNote: () => void;
  onImportDocument: (text: string, title: string) => void;
  onOpenSettings: () => void;
}

export default function NoteList({ 
  notes, 
  activeNoteId, 
  onNoteSelect, 
  onCreateNote,
  onImportDocument,
  onOpenSettings
}: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [view, setView] = useState<'home' | 'folders' | 'search'>('home');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [notes]);
  
  // Create a sample folder structure (this would come from actual data in a real app)
  const folders = useMemo(() => {
    // Extract unique folder paths from notes
    const uniquePaths = new Set<string>();
    notes.forEach(note => {
      if (note.folderPath) {
        uniquePaths.add(note.folderPath);
        
        // Add parent paths as well
        let path = note.folderPath;
        while (path.lastIndexOf('/') > 0) {
          path = path.substring(0, path.lastIndexOf('/'));
          uniquePaths.add(path);
        }
      }
    });
    
    // Add root path
    uniquePaths.add('/');
    
    // Create folder objects
    const folderMap: Record<string, FolderType> = {};
    
    // First create all folder objects
    Array.from(uniquePaths).forEach(path => {
      const name = path === '/' ? 'My Notes' : path.substring(path.lastIndexOf('/') + 1);
      const parentPath = path === '/' ? null : path.substring(0, Math.max(0, path.lastIndexOf('/'))) || '/';
      
      folderMap[path] = {
        id: path,
        name,
        path,
        parentId: parentPath,
        children: []
      };
    });
    
    // Then build the hierarchy
    Object.values(folderMap).forEach((folder: FolderType) => {
      if (folder.parentId !== null && folderMap[folder.parentId]) {
        folderMap[folder.parentId].children.push(folder);
      }
    });
    
    // Return root folder
    return folderMap['/'] ? [folderMap['/']] : [];
  }, [notes]);
  
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
        // If note has no folderPath, and we're looking at root folder
        if (!note.folderPath && activeFolder === '/') {
          return true;
        }
        return note.folderPath === activeFolder;
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
    onImportDocument(text, title);
  };
  
  return (
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
              <button 
                className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
                aria-label="Add new folder"
                title="Add new folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
            <div>
              {folders.map(folder => (
                <FolderItem
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
          <div className="border-t border-gray-200 py-2">
            <TagSection
              allTags={allTags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
            />
          </div>
          
          {/* Notes list */}
          {(view === 'home' || view === 'search') && (
            <div className="border-t border-gray-200">
              <div className="flex items-center justify-between p-2 bg-gray-50">
                <h2 className="text-sm font-semibold px-2">
                  {view === 'search' ? 'Search Results' : 'All Notes'}
                </h2>
                <div className="flex space-x-1">
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
                    onClick={onCreateNote}
                    aria-label="Create new note"
                    title="Create new note"
                  >
                    <PenSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div>
                {filteredNotes.length > 0 ? (
                  filteredNotes.map(note => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isActive={note.id === activeNoteId}
                      onClick={() => onNoteSelect(note)}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery || selectedTags.length > 0 ? 'No matching notes found' : 'No notes yet'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom action bar - fixed */}
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
              onClick={onCreateNote}
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
  );
} 