'use client';

import { useState, useEffect } from 'react';
import NoteList from '@/components/notes/NoteList';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteDetails from '@/components/notes/NoteDetails';
import Settings from '@/components/notes/Settings';
import { Note, SummaryType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { exportNoteToAnki } from '@/lib/api/anki';
import { generateSummary, OPENROUTER_MODELS } from '@/lib/api/openrouter';

// Create some sample notes for testing
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Introduction to Biology',
    content: 'Biology is the study of living organisms and their interactions with each other and their environments.',
    tags: ['Biology'],
    createdAt: new Date(2023, 4, 10).toISOString(),
    updatedAt: new Date(2023, 4, 10).toISOString(),
  },
  {
    id: '2',
    title: 'Quantum Physics Basics',
    content: 'Quantum physics deals with the behavior of matter and light on the atomic and subatomic scales.',
    tags: ['Physics'],
    createdAt: new Date(2023, 4, 15).toISOString(),
    updatedAt: new Date(2023, 4, 15).toISOString(),
  },
  {
    id: '3',
    title: 'Literature Review Methods',
    content: 'A literature review surveys scholarly articles, books, and other sources relevant to a particular issue, research question, or theory.',
    tags: ['Research'],
    createdAt: new Date(2023, 4, 20).toISOString(),
    updatedAt: new Date(2023, 4, 20).toISOString(),
  },
];

export default function Home() {
  // State for notes and active note
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
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
  
  // Create a new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
  
  // Generate a summary for the active note
  const handleGenerateSummary = async (type: SummaryType) => {
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
        model: selectedModel,
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
      setStatusMessage(error instanceof Error ? error.message : 'Error generating summary');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };
  
  // Export the active note to Anki
  const handleExportAnki = () => {
    if (!activeNoteId || !activeNote) return;
    
    try {
      exportNoteToAnki(activeNote);
      setStatusMessage('Note exported to Anki successfully');
    } catch (error) {
      console.error('Error exporting to Anki:', error);
      setStatusMessage('Error exporting to Anki');
    }
    
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Save settings
  const handleSaveSettings = (newApiKey: string, newModel: string) => {
    setApiKey(newApiKey);
    setSelectedModel(newModel);
    
    // Save to localStorage
    localStorage.setItem('openrouterApiKey', newApiKey);
    localStorage.setItem('selectedModel', newModel);
    
    setStatusMessage('Settings saved successfully');
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  return (
    <div className="flex h-screen relative bg-white">
      {/* Left Sidebar - Notes List */}
      <NoteList 
        notes={notes}
        activeNoteId={activeNoteId}
        onNoteSelect={handleNoteSelect}
        onCreateNote={handleCreateNote}
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
        onGenerateSummary={handleGenerateSummary}
        onExportAnki={handleExportAnki}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        onSaveSettings={handleSaveSettings}
      />
      
      {/* Status Message */}
      {statusMessage && (
        <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
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
