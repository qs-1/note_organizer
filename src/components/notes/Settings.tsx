import { useState } from 'react';
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
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newApiKey, newModel);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="apiKey">
              OpenRouter API Key
            </label>
            <input
              id="apiKey"
              type="password"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="sk_or-..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenRouter.ai</a>
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="model">
              Default AI Model
            </label>
            <select
              id="model"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            >
              {OPENROUTER_MODELS.map(model => (
                <option key={model.id} value={model.id}>
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