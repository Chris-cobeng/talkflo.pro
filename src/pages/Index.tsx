import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RecordingInterface from '@/components/RecordingInterface';
import NotesGrid from '@/components/NotesGrid';
import NoteModal from '@/components/NoteModal';
import SettingsModal from '@/components/SettingsModal';
import FolderModal from '@/components/FolderModal';
import FileUpload from '@/components/FileUpload';
import FloatingActionBar from '@/components/FloatingActionBar';
import UpgradeCard from '@/components/UpgradeCard';
import { Note, Folder } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Loader2, Upload, ArrowUpFromLine } from 'lucide-react';
import { Protect, useAuth, useUser } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const { has } = useAuth();
  const hasProPlan = has({ plan: 'talkflo_pro' });
  const [isRecording, setIsRecording] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileProcessingStep, setFileProcessingStep] = useState<'uploading' | 'transcribing' | 'rewriting' | 'saving'>('uploading');

  const {
    notes,
    folders,
    loading,
    refetch,
    createFolder,
    deleteFolder,
    deleteNotes,
    updateNote
  } = useSupabaseData();

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.rewrittenContent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentFolder === null || note.folderId === currentFolder;
    return matchesSearch && matchesFolder;
  });

  const handleNoteSelect = (noteId: string, selected: boolean) => {
    if (selected) {
      setSelectedNoteIds(prev => [...prev, noteId]);
    } else {
      setSelectedNoteIds(prev => prev.filter(id => id !== noteId));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteNotes(selectedNoteIds);
      setSelectedNoteIds([]);
      
      // toast({
      //   title: "Notes deleted",
      //   description: `Successfully deleted ${selectedNoteIds.length} notes`,
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to delete notes",
      //   variant: "destructive",
      // });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNotes([noteId]);
  };

  const handleClearSelection = () => {
    setSelectedNoteIds([]);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      
      // toast({
      //   title: "Folder created",
      //   description: `Successfully created folder "${name}"`,
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to create folder",
      //   variant: "destructive",
      // });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      
      if (currentFolder === folderId) {
        setCurrentFolder(null);
      }

      // toast({
      //   title: "Folder deleted",
      //   description: "Folder deleted and notes moved to All Notes",
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to delete folder",
      //   variant: "destructive",
      // });
    }
  };

  const handleUpdateNote = async (noteId: string, updatedContent: string) => {
    try {
      await updateNote(noteId, { rewritten_content: updatedContent });
      
      // toast({
      //   title: "Note updated",
      //   description: "Your changes have been saved successfully",
      // });
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to update note",
      //   variant: "destructive",
      // });
    }
  };

  const handleRecordingComplete = (note: Note) => {
    refetch();
    setSelectedNote(note);
  };

  const handleFileUploadClick = () => {
    // Check if user has pro plan for upload feature access
    if (!hasProPlan) {
      setShowUpgradeModal(true);
      return;
    }
    setShowFileUpload(true);
  };

  const handleTranscriptionComplete = (transcript: string, fileName: string, note?: Note) => {
    refetch();
    setIsFileProcessing(false);
    if (note) {
      setSelectedNote(note); // Automatically open the note popup
    }
  };

  const handleFileProcessingStart = () => {
    setIsFileProcessing(true);
    setFileProcessingStep('uploading');
    setShowFileUpload(false); // Close the modal immediately when processing starts
  };

  const handleFileProcessingStepChange = (step: 'uploading' | 'transcribing' | 'rewriting' | 'saving') => {
    setFileProcessingStep(step);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full inline-block">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          </div>
          <p className="text-gray-700 mt-4 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If settings is open, render only the settings page
  if (showSettings) {
    return <SettingsModal onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen relative">
      <Header onSettingsClick={() => setShowSettings(true)} />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-blue mb-2">
              Talkflo
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 px-4 font-light tagline-text">
            Cut through the mental clutter and articulate your brilliance. Rapidly.
          </p>
        </div>

        {selectedNoteIds.length === 0 && !isFileProcessing && (
          <RecordingInterface 
            onRecordingComplete={handleRecordingComplete} 
            currentFolder={currentFolder}
            noteCount={notes.length}
            hasProPlan={hasProPlan}
            onRecordingStateChange={setIsRecording}
          />
        )}

        {isFileProcessing && (
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="relative group">
              {/* Enhanced outer glow */}
              <div className="absolute -inset-6 bg-gradient-to-r from-orange-200/30 via-orange-300/20 to-orange-200/30 rounded-3xl sm:rounded-[2rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-white backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 max-w-sm sm:max-w-md w-full mx-4 animate-scale-in overflow-hidden">
                
                {/* Subtle animated background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.1)_0%,transparent_70%)]"></div>
                </div>
                
                {/* Content */}
                <div className="relative text-center">
                  {/* Enhanced title with better typography */}
                  <h2 className="text-slate-800 text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text tracking-tight">
                    {fileProcessingStep === 'uploading' ? 'Uploading' : 
                     fileProcessingStep === 'transcribing' ? 'Transcribing' : 
                     fileProcessingStep === 'rewriting' ? 'Rewriting' : 'Saving...'}
                  </h2>
                  
                  {/* Enhanced step indicator */}
                  {fileProcessingStep !== 'saving' && (
                    <p className="text-slate-500 text-lg sm:text-xl font-medium mb-8 sm:mb-10 opacity-80">
                      Step <span className="font-bold text-slate-600">{fileProcessingStep === 'uploading' ? '1' : fileProcessingStep === 'transcribing' ? '2' : '3'}</span> of <span className="font-bold text-slate-600">3</span>
                    </p>
                  )}
                  
                  {/* Enhanced progress section */}
                  <div className="mb-6 sm:mb-8">
                    {/* Progress bar container with enhanced styling */}
                    <div className="relative mb-5">
                      <div className="h-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 overflow-hidden rounded-full shadow-inner border border-slate-200/50">
                        <div 
                          className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-full relative overflow-hidden transition-all duration-700 ease-out rounded-full"
                          style={{ 
                            width: `${
                              fileProcessingStep === 'uploading' ? '25%' :
                              fileProcessingStep === 'transcribing' ? '50%' :
                              fileProcessingStep === 'rewriting' ? '75%' :
                              '90%'
                            }` 
                          }}
                        >
                          {/* Animated shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced percentage display */}
                    <p className="text-slate-600 text-base sm:text-lg font-semibold">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                        {fileProcessingStep === 'uploading' ? '25' : 
                         fileProcessingStep === 'transcribing' ? '50' : 
                         fileProcessingStep === 'rewriting' ? '75' : '90'}%
                      </span> complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-full">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            </div>
          </div>
        ) : (
          <NotesGrid
            notes={filteredNotes}
            folders={folders}
            searchQuery={searchQuery}
            selectedNoteIds={selectedNoteIds}
            currentFolder={currentFolder}
            viewMode={viewMode}
            onSearchChange={setSearchQuery}
            onNoteClick={setSelectedNote}
            onNoteSelect={handleNoteSelect}
            onBulkDelete={handleBulkDelete}
            onFolderClick={setCurrentFolder}
            onManageFolders={() => setShowFolders(true)}
            onViewModeChange={setViewMode}
          />
        )}
      </main>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedNoteIds.length}
        onDelete={handleBulkDelete}
        onClear={handleClearSelection}
        isVisible={selectedNoteIds.length > 0}
      />

      {/* Enhanced Floating Action Button */}
      {selectedNoteIds.length === 0 && !isRecording && (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <Protect
              plan="talkflo_pro"
              fallback={
                <button
                  onClick={handleFileUploadClick}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 bg-black hover:bg-neutral-800 rounded-full flex items-center justify-center shadow-beautiful hover:shadow-beautiful-hover transition-beautiful hover:scale-105 ripple"
                  title="Upload audio file (Pro feature)"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </button>
              }
            >
              <button
                onClick={() => setShowFileUpload(true)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 bg-black hover:bg-neutral-800 rounded-full flex items-center justify-center shadow-beautiful hover:shadow-beautiful-hover transition-beautiful hover:scale-105 ripple"
                title="Upload audio file"
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </Protect>
          </div>
        </div>
      )}

      {/* Enhanced File Upload Modal */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="sm:max-w-md mx-4 max-w-[calc(100vw-2rem)] glass border-0 shadow-beautiful">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold gradient-text">
              Upload Audio File
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Protect
              plan="talkflo_pro"
              fallback={
                <UpgradeCard 
                  title="Feature Locked"
                  description="This feature requires Talkflo Prime. Upgrade now to access unlimited uploads and advanced features."
                  feature="file uploads"
                  className="mx-0"
                />
              }
            >
              <p className="text-center text-gray-700 mb-6 text-sm sm:text-base px-2 font-medium">
                Upload an audio file to get it transcribed and added to your notes
              </p>
              <FileUpload 
                onTranscriptionComplete={handleTranscriptionComplete} 
                currentFolder={currentFolder}
                onProcessingStart={handleFileProcessingStart}
                onProcessingStepChange={handleFileProcessingStepChange}
              />
            </Protect>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keep existing modals the same */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}



      {showFolders && (
        <FolderModal
          folders={folders}
          onClose={() => setShowFolders(false)}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md mx-4 max-w-[calc(100vw-2rem)] glass border-0 shadow-beautiful">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold gradient-text">
              Upgrade Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <UpgradeCard 
              title="Feature Locked"
              description="This feature requires Talkflo Prime. Upgrade now to access unlimited uploads and advanced features."
              feature="file uploads"
              className="mx-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
