import { Trash2, X } from 'lucide-react';

interface FloatingActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isVisible: boolean;
}

const FloatingActionBar = ({ selectedCount, onDelete, onClear, isVisible }: FloatingActionBarProps) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
    }`}>
      <div className="glass rounded-full px-6 py-4 shadow-beautiful-hover border border-white/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/20 rounded-full transition-beautiful text-sm font-medium min-h-[40px] ripple"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
            
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full transition-beautiful text-sm font-medium shadow-beautiful hover:shadow-beautiful-hover min-h-[40px] ripple"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionBar;
