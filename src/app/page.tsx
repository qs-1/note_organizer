'use client';

import { useState, useEffect } from 'react';
import NoteList from '@/components/notes/NoteList';
import DraggableNoteList from '@/components/notes/DraggableNoteList';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteDetails from '@/components/notes/NoteDetails';
import Settings from '@/components/notes/Settings';
import { Note, SummaryType, Folder } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { exportNoteToAnki } from '@/lib/api/anki';
import { generateSummary, OPENROUTER_MODELS } from '@/lib/api/openrouter';

// Create some sample notes for testing
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Introduction to Biology',
    content: 'Biology is the study of living organisms and their interactions with each other and their environments.',
    tags: ['Biology', 'Science'],
    createdAt: new Date(2023, 4, 10).toISOString(),
    updatedAt: new Date(2023, 4, 10).toISOString(),
    folderPath: '/academics/biology'
  },
  {
    id: '2',
    title: 'Quantum Physics Basics',
    content: 'Quantum physics deals with the behavior of matter and light on the atomic and subatomic scales.',
    tags: ['Physics', 'Science'],
    createdAt: new Date(2023, 4, 15).toISOString(),
    updatedAt: new Date(2023, 4, 15).toISOString(),
    folderPath: '/academics/physics'
  },
  {
    id: '3',
    title: 'Literature Review Methods',
    content: 'A literature review surveys scholarly articles, books, and other sources relevant to a particular issue, research question, or theory.',
    tags: ['Research', 'Academic'],
    createdAt: new Date(2023, 4, 20).toISOString(),
    updatedAt: new Date(2023, 4, 20).toISOString(),
    folderPath: '/academics'
  },
  {
    id: '4',
    title: 'Travel Plans',
    content: 'Ideas for summer vacation destinations and activities.',
    tags: ['Travel', 'Planning'],
    createdAt: new Date(2023, 5, 1).toISOString(),
    updatedAt: new Date(2023, 5, 1).toISOString(),
    folderPath: '/personal'
  }
];

export default function Home() {
  // State for notes and active note
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>('/');
  
  // Settings for OpenRouter
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(OPENROUTER_MODELS[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Status messages
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Get the active note
  const activeNote = activeNoteId 
    ? notes.find(note => note.id === activeNoteId) || null
    : null;
  
  // Load saved notes and settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load notes
      const savedNotes = localStorage.getItem('smartNotes');
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          setNotes(parsedNotes);
          
          // Set the first note as active if any exist
          if (parsedNotes.length > 0 && !activeNoteId) {
            setActiveNoteId(parsedNotes[0].id);
          }
        } catch (error) {
          console.error('Error parsing saved notes:', error);
        }
      }
      
      // Load API key
      const savedApiKey = localStorage.getItem('openrouterApiKey');
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      // Load selected model
      const savedModel = localStorage.getItem('selectedModel');
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartNotes', JSON.stringify(notes));
    }
  }, [notes]);
  
  // Handle moving items (folders or notes) via drag and drop
  const handleMoveItem = (sourceId: string, sourcePath: string, targetPath: string, itemType: 'FOLDER' | 'NOTE') => {
    if (itemType === 'FOLDER') {
      // When moving a folder, we need to preserve its structure
      // If sourcePath is /folderA and targetPath is /folderB, we want notes to move from /folderA/* to /folderB/folderA/*
      
      // Get the folder name from sourcePath
      const sourceFolder = sourcePath.split('/').filter(Boolean).pop();
      
      // Create the new path for the folder
      const newFolderPath = targetPath === '/' 
        ? `/${sourceFolder}` 
        : `${targetPath}/${sourceFolder}`;
      
      // Update all notes in this folder and its subfolders
      const updatedNotes = notes.map(note => {
        // Check if the note is in the folder being moved or any of its subfolders
        if (note.folderPath && (note.folderPath === sourcePath || note.folderPath.startsWith(sourcePath + '/'))) {
          // Replace the folder path prefix to maintain subfolder structure
          const newPath = note.folderPath.replace(sourcePath, newFolderPath);
          return {
            ...note,
            folderPath: newPath,
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      setStatusMessage(`Folder moved successfully`);
    } else {
      // Moving a note
      const updatedNotes = notes.map(note => {
        if (note.id === sourceId) {
          return {
            ...note,
            folderPath: targetPath === '/' ? null : targetPath,
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      setStatusMessage(`Note moved successfully`);
    }
    
    // Clear status message after a delay
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };
  
  // Create a new folder
  const handleAddFolder = (name: string, parentPath: string) => {
    const folderPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    
    // Check if folder already exists
    const folderExists = notes.some(note => note.folderPath === folderPath);
    
    if (folderExists) {
      setStatusMessage('Folder already exists');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    // We don't need to create a note to make the folder visible anymore
    // With our improved folder structure logic, empty folders will appear too
    setStatusMessage('Folder created successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Delete a folder and all notes inside it
  const handleDeleteFolder = (folderPath: string) => {
    // Filter out all notes that are in this folder or its subfolders
    const updatedNotes = notes.filter(note => {
      // Keep notes that don't have a folderPath
      if (!note.folderPath) return true;
      
      // Keep notes that are not in the folder being deleted
      // A note is in the folder if its folderPath is the same as the folderPath
      // or if it starts with folderPath + '/'
      return !(note.folderPath === folderPath || note.folderPath.startsWith(folderPath + '/'));
    });
    
    // Update notes
    setNotes(updatedNotes);
    
    // If the active note was deleted, clear the active note
    if (activeNoteId && activeNote && (
      activeNote.folderPath === folderPath || 
      (activeNote.folderPath && activeNote.folderPath.startsWith(folderPath + '/'))
    )) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
    
    // Reset the active folder if it was deleted
    if (activeFolder === folderPath || (activeFolder && activeFolder.startsWith(folderPath + '/'))) {
      setActiveFolder('/');
    }
    
    setStatusMessage('Folder deleted successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Create a new note
  const handleCreateNote = (folderPath: string = '/') => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderPath: folderPath === '/' ? null : folderPath
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };
  
  // Select a note
  const handleNoteSelect = (note: Note) => {
    setActiveNoteId(note.id);
  };
  
  // Save note changes
  const handleSaveNote = (updatedContent: string, updatedTitle: string) => {
    if (!activeNoteId) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) {
        return {
          ...note,
          title: updatedTitle,
          content: updatedContent,
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    setStatusMessage('Note saved successfully');
    
    // Clear status message after a delay
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };
  
  // Add a tag to the active note
  const handleAddTag = (tag: string) => {
    if (!activeNoteId) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) {
        // Only add the tag if it doesn't already exist
        if (!note.tags.includes(tag)) {
          return {
            ...note,
            tags: [...note.tags, tag],
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return note;
    });
    
    setNotes(updatedNotes);
  };
  
  // Remove a tag from the active note
  const handleRemoveTag = (tag: string) => {
    if (!activeNoteId) return;
    
    const updatedNotes = notes.map(note => {
      if (note.id === activeNoteId) {
        return {
          ...note,
          tags: note.tags.filter(t => t !== tag),
          updatedAt: new Date().toISOString(),
        };
      }
      return note;
    });
    
    setNotes(updatedNotes);
  };
  
  // Delete the active note
  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    
    // Remove the note from the list
    const updatedNotes = notes.filter(note => note.id !== activeNoteId);
    setNotes(updatedNotes);
    
    // Clear the active note
    setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    
    // Show success message
    setStatusMessage('Note deleted successfully');
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };
  
  // Generate a summary for the active note
  const handleGenerateSummary = async (type: SummaryType, model?: string) => {
    if (!activeNoteId || !activeNote) {
      setStatusMessage('Please select a note first');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    if (!apiKey) {
      setStatusMessage('Please add your OpenRouter API key in settings');
      setIsSettingsOpen(true);
      return;
    }
    
    setIsProcessing(true);
    setStatusMessage('Generating summary...');
    
    try {
      const summary = await generateSummary({
        text: activeNote.content,
        model: model || selectedModel,
        type,
        apiKey,
      });
      
      // Update the note with the summary
      const updatedNotes = notes.map(note => {
        if (note.id === activeNoteId) {
          return {
            ...note,
            summary,
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });
      
      setNotes(updatedNotes);
      setStatusMessage('Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      setStatusMessage('Failed to generate summary');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };
  
  // Export the active note to Anki
  const handleExportAnki = () => {
    if (!activeNoteId || !activeNote) {
      setStatusMessage('Please select a note first');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    try {
      exportNoteToAnki(activeNote);
      setStatusMessage('Note exported to Anki successfully');
    } catch (error) {
      console.error('Error exporting to Anki:', error);
      setStatusMessage('Failed to export to Anki');
    }
    
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Save settings
  const handleSaveSettings = (newApiKey: string, newModel: string) => {
    setApiKey(newApiKey);
    setSelectedModel(newModel);
    setIsSettingsOpen(false);
    
    // Save settings to localStorage
    localStorage.setItem('openrouterApiKey', newApiKey);
    localStorage.setItem('selectedModel', newModel);
    
    setStatusMessage('Settings saved successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Import document
  const handleImportDocument = (text: string, title: string, folderPath: string = '/') => {
    const newNote: Note = {
      id: uuidv4(),
      title,
      content: text,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderPath: folderPath === '/' ? null : folderPath
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setStatusMessage('Document imported successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Delete note from sidebar
  const handleDeleteNoteFromSidebar = (noteId: string) => {
    // Remove the note from the list
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    // Clear the active note if it was deleted
    if (activeNoteId === noteId) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
    
    setStatusMessage('Note deleted successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  return (
    <div className="flex h-screen relative bg-white">
      {/* Left Sidebar - Notes List */}
      <DraggableNoteList 
        notes={notes}
        activeNoteId={activeNoteId}
        onNoteSelect={handleNoteSelect}
        onCreateNote={handleCreateNote}
        onImportDocument={handleImportDocument}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onMoveItem={handleMoveItem}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        onDeleteNote={handleDeleteNoteFromSidebar}
      />
      
      {/* Main Content Area */}
      <NoteEditor 
        note={activeNote}
        onSave={handleSaveNote}
      />
      
      {/* Right Sidebar - Note Details */}
      <NoteDetails 
        note={activeNote} 
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onDelete={handleDeleteNote}
        onGenerateSummary={handleGenerateSummary}
        isProcessing={isProcessing}
        onExportAnki={handleExportAnki}
      />
      
      {/* Settings Modal */}
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        onSave={handleSaveSettings}
      />
      
      {/* Status Message */}
      {statusMessage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-50 text-green-700 px-3 py-1.5 text-xs rounded-md shadow-sm border border-green-100">
          {statusMessage}
        </div>
      )}
      
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-center text-gray-800">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
