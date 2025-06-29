import { Search, FolderPlus, Folder, FileText, Grid3X3, List } from 'lucide-react';
import { Note, Folder as FolderType } from '@/types';
import NoteCard from './NoteCard';
import NoteListItem from './NoteListItem';

interface NotesGridProps {
  notes: Note[];
  folders: FolderType[];
  searchQuery: string;
  selectedNoteIds: string[];
  currentFolder: string | null;
  viewMode: 'grid' | 'list';
  onSearchChange: (query: string) => void;
  onNoteClick: (note: Note) => void;
  onNoteSelect: (noteId: string, selected: boolean) => void;
  onBulkDelete: () => void;
  onFolderClick: (folderId: string | null) => void;
  onManageFolders: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const NotesGrid = ({
  notes,
  folders,
  searchQuery,
  selectedNoteIds,
  currentFolder,
  viewMode,
  onSearchChange,
  onNoteClick,
  onNoteSelect,
  onBulkDelete,
  onFolderClick,
  onManageFolders,
  onViewModeChange
}: NotesGridProps) => {
  const currentFolderName = currentFolder 
    ? folders.find(f => f.id === currentFolder)?.name 
    : 'All Notes';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Folder Navigation */}
      <div className="space-y-4 sm:space-y-6">

        {/* Enhanced Folder Pills */}
        <div className="px-2">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto flex-nowrap pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 hide-scrollbar">
            <button
              onClick={() => onFolderClick(null)}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-beautiful whitespace-nowrap min-h-[36px] shadow-beautiful ${
                currentFolder === null
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-beautiful-hover'
                  : 'glass text-gray-700'
              } ripple`}
            >
              <span>All Notes</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                currentFolder === null ? 'bg-white/20' : 'bg-orange-100 text-orange-800'
              }`}>
                {notes.filter(note => note.folderId === undefined).length}
              </span>
            </button>
            
            {folders.map((folder, idx) => (
              <button
                key={folder.id}
                onClick={() => onFolderClick(folder.id)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-beautiful whitespace-nowrap min-h-[36px] shadow-beautiful ${
                  currentFolder === folder.id
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-beautiful-hover'
                    : 'glass text-gray-700'
                } ripple`}
                style={{ marginRight: idx !== folders.length - 1 ? '0.5rem' : 0 }}
              >
                <span>{folder.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentFolder === folder.id ? 'bg-white/20' : 'bg-orange-100 text-orange-800'
                }`}>
                  {folder.noteCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-300 blur"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-4 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl focus:outline-none text-base sm:text-sm placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Controls Container for Create Folder and View Toggle */}
      <div className={`${viewMode === 'grid' ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 flex justify-between items-center`}>
        {/* Create Folder Button */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl opacity-10 transition-opacity duration-300 blur"></div>
          <button
            onClick={onManageFolders}
            className="relative flex items-center gap-1 px-2 py-2 glass rounded-xl transition-beautiful text-sm sm:text-base min-h-[40px] font-semibold shadow-beautiful hover:shadow-beautiful-hover ripple"
          >
            <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
          </button>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center glass rounded-full p-1 shadow-beautiful">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-full transition-beautiful min-w-[28px] min-h-[28px] flex items-center justify-center ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white shadow-beautiful-hover' 
                : 'text-gray-600 hover:bg-white/20'
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-full transition-beautiful min-w-[28px] min-h-[28px] flex items-center justify-center ${
              viewMode === 'list' 
                ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white shadow-beautiful-hover' 
                : 'text-gray-600 hover:bg-white/20'
            }`}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Enhanced Notes Grid/List */}
      {viewMode === 'grid' ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 max-w-7xl mx-auto px-4 space-y-4 sm:space-y-6">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className="animate-fade-in break-inside-avoid mb-4 sm:mb-6"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <NoteCard
              note={note}
              isSelected={selectedNoteIds.includes(note.id)}
              onSelect={(selected) => onNoteSelect(note.id, selected)}
              onClick={() => onNoteClick(note)}
              hasAnySelection={selectedNoteIds.length > 0}
            />
          </div>
        ))}
        </div>
      ) : (
        <div className="space-y-3 max-w-5xl mx-auto px-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <NoteListItem
                note={note}
                isSelected={selectedNoteIds.includes(note.id)}
                onSelect={(selected) => onNoteSelect(note.id, selected)}
                onClick={() => onNoteClick(note)}
                hasAnySelection={selectedNoteIds.length > 0}
              />
            </div>
          ))}
        </div>
      )}

      {notes.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="glass rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-beautiful">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
            <p className="text-gray-600 text-sm sm:text-base">Start recording to create your first note!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesGrid;
