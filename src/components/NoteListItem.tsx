import { Note } from '@/types';
import { formatDate } from '@/lib/utils';

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  hasAnySelection: boolean;
}

const NoteListItem = ({ note, isSelected, onSelect, onClick, hasAnySelection }: NoteListItemProps) => {
  const handleItemClick = (e: React.MouseEvent) => {
    // If clicking the checkbox/radio button, handle selection
    if ((e.target as HTMLElement).closest('.checkbox-container')) {
      onSelect(!isSelected);
      return;
    }
    
    // If any note is selected (radio button mode), only allow selection
    if (hasAnySelection) {
      onSelect(!isSelected);
      return;
    }
    
    // If no notes are selected, open detail popup
    onClick();
  };

  return (
    <div
      className={`group glass rounded-lg p-4 shadow-beautiful hover:shadow-beautiful-hover transition-beautiful cursor-pointer border-0 relative overflow-hidden ${
        isSelected ? 'outline outline-2 outline-black/70 bg-gradient-to-r from-orange-50/60 to-orange-100/30' : ''
      }`}
      onClick={handleItemClick}
    >
      {/* Beautiful gradient overlay for selected state */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-orange-600/5 pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              <span className="text-gray-500 text-sm font-medium bg-white/30 px-2 py-1 rounded-full">
                {formatDate(note.createdAt)}
              </span>
              {note.isPrivate && (
                <span className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                  private
                </span>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 text-base leading-relaxed line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
            {note.rewrittenContent}
          </p>
        </div>

        {/* Round checkbox */}
        <div className="checkbox-container flex-shrink-0 ml-4 z-20">
          <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 cursor-pointer ${
            isSelected 
              ? 'bg-black border-black shadow-lg' 
              : 'bg-white/80 border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 pointer-events-auto"
            />
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subtle hover glow effect */}
      {/* Removed hover gradient overlay */}
    </div>
  );
};

export default NoteListItem;
