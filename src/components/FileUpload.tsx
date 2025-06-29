import { useState } from 'react';
import { Upload, FileAudio, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Note } from '@/types';

interface FileUploadProps {
  onTranscriptionComplete?: (transcript: string, fileName: string, note?: Note) => void;
  currentFolder?: string | null;
  onProcessingStart?: () => void;
  onProcessingStepChange?: (step: 'uploading' | 'transcribing' | 'rewriting' | 'saving') => void;
}

const FileUpload = ({ onTranscriptionComplete, currentFolder, onProcessingStart, onProcessingStepChange }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|m4a|ogg|flac)$/i)
    );

    if (!audioFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A, OGG, FLAC)",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(audioFile);
    processFile(audioFile);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    onProcessingStart?.();
    onProcessingStepChange?.('uploading');
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        onProcessingStepChange?.('transcribing');
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) {
          throw error;
        }

        if (data?.text) {
          onProcessingStepChange?.('rewriting');
          const { data: rewriteData, error: rewriteError } = await supabase.functions.invoke('rewrite-content', {
            body: { 
              text: data.text,
              style: 'professional',
              length: 'medium'
            }
          });

          if (rewriteError) {
            throw rewriteError;
          }

          onProcessingStepChange?.('saving');
          const noteData = {
            clerk_user_id: user!.id,
            title: file.name.replace(/\.[^/.]+$/, ""),
            original_transcript: data.text,
            rewritten_content: rewriteData?.rewrittenText || data.text,
            category: 'Audio Upload',
            ...(currentFolder && { folder_id: currentFolder })
          };

          const { data: insertData, error: insertError } = await supabase
            .from('notes')
            .insert(noteData)
            .select();

          if (insertError) {
            throw insertError;
          }

          // Transform database note to frontend Note interface
          let createdNote: Note | undefined;
          if (insertData && insertData[0]) {
            const dbNote = insertData[0];
            createdNote = {
              id: dbNote.id,
              title: dbNote.title,
              originalTranscript: dbNote.original_transcript,
              rewrittenContent: dbNote.rewritten_content,
              createdAt: dbNote.created_at || '',
              tags: dbNote.tags || [],
              category: dbNote.category || 'Audio Upload',
              isPrivate: dbNote.is_private || false,
              audioUrl: dbNote.audio_url || undefined,
              folderId: dbNote.folder_id || undefined
            };
          }

          onTranscriptionComplete?.(data.text, file.name, createdNote);
          
          toast({
            title: "Transcription complete",
            description: `Successfully transcribed ${file.name}`,
          });
          
          setUploadedFile(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Transcription failed",
        description: "There was an error processing your audio file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-beautiful ${
            isDragging
              ? 'border-orange-400 bg-orange-50/50 scale-105'
              : 'border-gray-300 hover:border-orange-300 glass hover:bg-white/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full inline-block mb-4 sm:mb-6">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 gradient-text">
            Upload Audio File
          </h3>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 px-2 font-medium">
            Drag and drop an audio file here, or tap to browse
          </p>
          <p className="text-xs sm:text-sm text-gray-500 bg-white/30 px-3 py-2 rounded-full inline-block">
            Supports MP3, WAV, M4A, OGG, FLAC
          </p>
        </div>
      ) : (
        <div className="glass border-0 rounded-2xl p-6 sm:p-8 shadow-beautiful">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-full">
                  <FileAudio className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                  {uploadedFile.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={removeFile}
                className="p-2 hover:bg-white/20 rounded-full transition-beautiful min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 group ripple"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
              </button>
            )}
          </div>
          
          {isUploading && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-full">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-semibold">
                  Processing...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
