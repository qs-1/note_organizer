import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { OPENROUTER_MODELS } from '@/lib/api/openrouter';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  selectedModel: string;
  onSaveSettings: (apiKey: string, model: string) => void;
}

export default function Settings({ 
  isOpen, 
  onClose, 
  apiKey, 
  selectedModel,
  onSaveSettings 
}: SettingsProps) {
  const [key, setKey] = useState(apiKey);
  const [model, setModel] = useState(selectedModel);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(key, model);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            OpenRouter API Key
          </label>
          <input 
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your OpenRouter API key"
          />
          <p className="mt-1 text-xs text-gray-500">
            You can get a key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openrouter.ai/keys</a>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            AI Model
          </label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {OPENROUTER_MODELS.map(modelOption => (
              <option key={modelOption.id} value={modelOption.id}>
                {modelOption.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select a model for AI summaries. Free models have (Free) in their name.
          </p>
        </div>

        <div className="flex justify-end">
          <button 
            className="px-4 py-2 mr-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 