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
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <input
          type="text"
          className="text-xl font-medium text-gray-800 w-full border-none focus:outline-none focus:ring-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
        />
        
        <button
          className={`px-3 py-1 rounded-md ml-2 ${
            hasChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save
        </button>
      </div>
      
      <textarea
        className="flex-1 p-4 text-gray-800 resize-none w-full border-none focus:outline-none focus:ring-0"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note here..."
      />
    </div>
  );
} 