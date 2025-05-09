import { useState } from 'react';
import { Search, Plus, FileUp } from 'lucide-react';
import { Note } from '@/types';
import FileUploader from './FileUploader';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

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
        <h3 className="font-medium text-gray-800">{note.title}</h3>
        <span className="text-xs text-gray-500">{formatDate(note.updatedAt)}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
      {note.tags.length > 0 && (
        <div className="mt-2">
          {note.tags.map(tag => (
            <span key={tag} className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md mr-1">
              {tag}
            </span>
          ))}
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
}

export default function NoteList({ 
  notes, 
  activeNoteId, 
  onNoteSelect, 
  onCreateNote,
  onImportDocument
}: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  
  // Filter notes based on search query
  const filteredNotes = searchQuery 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes;

  // Handle text extraction from uploaded files
  const handleTextExtracted = (text: string, filename: string) => {
    // Extract title from filename (remove extension)
    const title = filename.split('.').slice(0, -1).join('.');
    onImportDocument(text, title);
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full text-gray-800">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Notes</h1>
        <div className="flex space-x-1">
          <button 
            className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
            onClick={() => setIsFileUploaderOpen(true)}
            aria-label="Import document"
            title="Import document"
          >
            <FileUp className="h-5 w-5" />
          </button>
          <button 
            className="p-1 rounded-full hover:bg-gray-200 text-gray-700"
            onClick={onCreateNote}
            aria-label="Create new note"
            title="Create new note"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-3">
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
      
      <div className="flex-1 overflow-auto">
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
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </div>
        )}
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