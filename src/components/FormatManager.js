import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';

const FormatManager = () => {
  const [formatFields, setFormatFields] = useState([
    { 
      id: 'status_message', 
      template: '${is_watching} ( ${last_played} )' 
    }
  ]);

  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetchFormatSettings();
  }, []);

  const fetchFormatSettings = async () => {
    try {
      const response = await fetch('/api/format-settings');
      const data = await response.json();
      setFormatFields(data.fields || formatFields);
      updatePreview(data.fields || formatFields);
    } catch (error) {
      console.error('Error loading format settings:', error);
    }
  };

  const handleAddField = () => {
    setFormatFields([...formatFields, { 
      id: 'field_name',
      template: '${variable}'
    }]);
  };

  const handleRemoveField = (index) => {
    setFormatFields(formatFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field) => {
    const newFields = [...formatFields];
    newFields[index] = field;
    setFormatFields(newFields);
    updatePreview(newFields);
  };

  const updatePreview = (fields) => {
    const sampleData = {
      user_id: '12345',
      friendly_name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      is_active: 1,
      is_admin: 0,
      last_seen: Math.floor(Date.now() / 1000) - 3600,
      total_plays: 150,
      last_played: 'The Matrix',
      media_type: 'Movie',
      is_watching: 'Watching',
      minutes: 60
    };

    const preview = fields.map(field => {
      let result = field.template;
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\$\{${key}}`, 'g');
        result = result.replace(regex, value || '');
      });
      return `${field.id}: ${result}`;
    }).join('\n');

    setPreview(preview);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/format-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: formatFields }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      updatePreview(formatFields);
    } catch (error) {
      console.error('Error saving format settings:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-[#0F172A] text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Format Manager</h1>
      
      <div className="space-y-4">
        {formatFields.map((field, index) => (
          <div key={index} className="flex gap-3 bg-[#1E293B] p-4 rounded-lg border border-gray-700">
            <input
              type="text"
              value={field.id}
              onChange={(e) => handleFieldChange(index, { ...field, id: e.target.value })}
              className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white"
              placeholder="Section ID"
            />
            <input
              type="text"
              value={field.template}
              onChange={(e) => handleFieldChange(index, { ...field, template: e.target.value })}
              className="flex-[2] p-2 bg-gray-800 border border-gray-600 rounded text-white"
              placeholder="Format Template"
            />
            <button
              onClick={() => handleRemoveField(index)}
              className="px-3 py-2 text-red-400 hover:text-red-300 rounded"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={handleAddField}
          className="flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      <div className="mt-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Available Variables</h2>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${friendly_name}'}</code>
            <span className="text-gray-400 text-sm">Display name</span>
          </div>
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${total_plays}'}</code>
            <span className="text-gray-400 text-sm">Total play count</span>
          </div>
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${last_played}'}</code>
            <span className="text-gray-400 text-sm">Currently watching or last watched title</span>
          </div>
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${media_type}'}</code>
            <span className="text-gray-400 text-sm">Type of media being played</span>
          </div>
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${is_watching}'}</code>
            <span className="text-gray-400 text-sm">Current status ('Watching' or 'Watched')</span>
          </div>
          <div className="flex items-baseline gap-2">
            <code className="bg-gray-900 px-1 rounded text-sm font-mono text-blue-400">{'${last_seen_formatted}'}</code>
            <span className="text-gray-400 text-sm">Formatted last seen time</span>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">Preview</h3>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{preview}</pre>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 mt-6 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        <Save className="h-5 w-5" />
        Save Format Settings
      </button>
    </div>
  );
};

export default FormatManager;