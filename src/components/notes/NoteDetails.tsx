import { useState } from 'react';
import { Brain, Tag, X, Plus, Download, Copy, Check, ChevronDown } from 'lucide-react';
import { Note, SummaryType } from '@/types';
import { OPENROUTER_MODELS } from '@/lib/api/openrouter';

interface NoteDetailsProps {
  note: Note | null;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onGenerateSummary: (type: SummaryType, model?: string) => void;
  onExportAnki: () => void;
}

export default function NoteDetails({ 
  note, 
  onAddTag, 
  onRemoveTag, 
  onGenerateSummary, 
  onExportAnki
}: NoteDetailsProps) {
  const [newTag, setNewTag] = useState('');
  const [summaryType, setSummaryType] = useState<SummaryType>('brief');
  const [summaryMenuOpen, setSummaryMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(OPENROUTER_MODELS[0].id);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleCopySummary = () => {
    if (note?.summary) {
      navigator.clipboard.writeText(note.summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  // If no note is selected, show empty state
  if (!note) {
    return (
      <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Note Details</h3>
        </div>
        <div className="p-4 text-gray-500 text-center">
          Select a note to see details
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col text-gray-800">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Note Details</h3>
      </div>
      
      {/* Tags Section */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-800">
          <Tag className="h-4 w-4 text-gray-700" />
          <span>Tags</span>
        </h4>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {note.tags.length > 0 ? (
            note.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                {tag}
                <button 
                  className="ml-1 text-blue-500 hover:text-blue-700"
                  onClick={() => onRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-500">No tags yet</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input 
            type="text" 
            placeholder="Add tag..." 
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-800"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="ml-1 text-gray-600 hover:text-gray-700"
            onClick={handleAddTag}
            aria-label="Add tag"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Suggested tags will appear here</p>
      </div>
      
      {/* AI Tools Section */}
      <div className="p-4 border-b border-gray-200 flex flex-col">
        <h4 className="text-sm font-medium flex items-center gap-1 mb-2 text-gray-800">
          <Brain className="h-4 w-4 text-gray-700" />
          <span>AI Tools</span>
        </h4>
        
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-xs font-medium text-gray-800">Summary</h5>
            {note.summary && (
              <button 
                onClick={handleCopySummary}
                className="text-xs p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200"
                aria-label="Copy summary"
                title="Copy summary"
              >
                {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
          
          {note.summary ? (
            <div className="text-sm text-gray-600 mb-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
              <p>{note.summary}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-2 italic">No summary generated yet</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="relative">
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                onClick={() => setSummaryMenuOpen(!summaryMenuOpen)}
              >
                Generate Summary
              </button>
              
              {summaryMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="p-2">
                    <button 
                      className={`block w-full text-left px-2 py-1 text-xs rounded-md ${summaryType === 'brief' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'}`}
                      onClick={() => {
                        setSummaryType('brief');
                        setSummaryMenuOpen(false);
                        onGenerateSummary('brief', selectedModel);
                      }}
                    >
                      Brief (2-3 sentences)
                    </button>
                    <button 
                      className={`block w-full text-left px-2 py-1 text-xs rounded-md ${summaryType === 'detailed' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'}`}
                      onClick={() => {
                        setSummaryType('detailed');
                        setSummaryMenuOpen(false);
                        onGenerateSummary('detailed', selectedModel);
                      }}
                    >
                      Detailed
                    </button>
                    <button 
                      className={`block w-full text-left px-2 py-1 text-xs rounded-md ${summaryType === 'bullets' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'}`}
                      onClick={() => {
                        setSummaryType('bullets');
                        setSummaryMenuOpen(false);
                        onGenerateSummary('bullets', selectedModel);
                      }}
                    >
                      Bullet Points
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1"
                onClick={() => setModelMenuOpen(!modelMenuOpen)}
              >
                <span className="truncate max-w-[80px]">
                  {OPENROUTER_MODELS.find(m => m.id === selectedModel)?.name.split(' ')[0] || 'Model'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {modelMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-48">
                  <div className="p-2 max-h-48 overflow-y-auto">
                    {OPENROUTER_MODELS.map(modelOption => (
                      <button
                        key={modelOption.id}
                        className={`block w-full text-left px-2 py-1 text-xs rounded-md ${
                          selectedModel === modelOption.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedModel(modelOption.id);
                          setModelMenuOpen(false);
                        }}
                      >
                        {modelOption.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Flashcards Section */}
      <div className="p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-800">
          <Download className="h-4 w-4 text-gray-700" />
          <span>Flashcards</span>
        </h4>
        <p className="text-xs text-gray-500 mb-2">Export key highlights as flashcards</p>
        <button 
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          onClick={onExportAnki}
        >
          Export to Anki
        </button>
      </div>
    </div>
  );
} 