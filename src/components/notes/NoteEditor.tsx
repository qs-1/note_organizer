import { useState, useEffect, useMemo } from 'react';
import { Note } from '@/types';

interface NoteEditorProps {
  note: Note | null;
  onSave: (updatedContent: string, updatedTitle: string) => void;
}

export default function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  
  // Track original content and title when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTitle(note.title);
    } else {
      setContent('');
      setTitle('');
    }
  }, [note]);
  
  // Determine if content has been modified
  const hasChanges = useMemo(() => {
    if (!note) return false;
    return content !== note.content || title !== note.title;
  }, [content, title, note]);
  
  const handleSave = () => {
    if (note && hasChanges) {
      onSave(content, title);
    }
  };
  
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        Select a note or create a new one
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex-1 pr-4">
          <input
            type="text"
            className="w-full text-xl font-semibold bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
          />
        </div>
        <div className="flex space-x-2">
          {hasChanges && (
            <button 
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-white" style={{ backgroundColor: 'white' }}>
        <div className="p-6">
          <textarea
            className="w-full h-full text-gray-800 bg-white border-0 focus:ring-0 focus:outline-none resize-none"
            style={{ backgroundColor: 'white', color: '#2d3748', height: 'calc(100vh - 120px)' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
          />
        </div>
      </div>
    </div>
  );
} 