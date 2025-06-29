import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Folder } from '@/types';

interface FolderModalProps {
  folders: Folder[];
  onClose: () => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

const FolderModal = ({ folders, onClose, onCreateFolder, onDeleteFolder }: FolderModalProps) => {
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Folders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Create new folder */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Folder</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          {/* Existing folders */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Folders</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {folders.map((folder) => (
                <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{folder.name}</p>
                    <p className="text-sm text-gray-500">{folder.noteCount} notes</p>
                  </div>
                  <button
                    onClick={() => onDeleteFolder(folder.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {folders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No folders created yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderModal;
