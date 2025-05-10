import { useState, useEffect } from 'react';
import { OPENROUTER_MODELS } from '@/lib/api/openrouter';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  selectedModel: string;
  onSave: (apiKey: string, model: string) => void;
}

export default function Settings({ isOpen, onClose, apiKey, selectedModel, onSave }: SettingsProps) {
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [newModel, setNewModel] = useState(selectedModel);
  const [isEditingKey, setIsEditingKey] = useState(false);
  
  // Reset state when props change
  useEffect(() => {
    if (isOpen) {
      setNewApiKey(apiKey);
      setNewModel(selectedModel);
      setIsEditingKey(false);
    }
  }, [isOpen, apiKey, selectedModel]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newApiKey, newModel);
  };
  
  const handleDeleteKey = () => {
    setNewApiKey('');
    setIsEditingKey(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-900 text-sm font-medium mb-2" htmlFor="apiKey">
              OpenRouter API Key
            </label>
            <div className="relative">
              {apiKey && !isEditingKey ? (
                <>
                  <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm flex items-center select-none" style={{height: '40px'}}>
                    API key is set (hidden)
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 text-red-600 hover:text-red-800 bg-gray-50 hover:bg-red-50 rounded border border-red-100"
                    onClick={handleDeleteKey}
                  >
                    Delete Key
                  </button>
                </>
              ) : (
                <input
                  id="apiKey"
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter your OpenRouter API key"
                  style={{height: '40px'}}
                  autoFocus={isEditingKey}
                />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter.ai</a>
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-900 text-sm font-medium mb-2" htmlFor="model">
              Default AI Model
            </label>
            <select
              id="model"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            >
              {OPENROUTER_MODELS.map(model => (
                <option key={model.id} value={model.id} className="text-gray-900 bg-white">
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 