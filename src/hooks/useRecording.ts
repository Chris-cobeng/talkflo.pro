
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Note } from '@/types';

interface UseRecordingProps {
  onRecordingComplete?: (note: Note) => void;
  currentFolder?: string | null;
}

export const useRecording = ({ onRecordingComplete, currentFolder }: UseRecordingProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New granular processing states
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const { toast } = useToast();
  const { user } = useUser();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      // toast({
      //   title: "Recording Error",
      //   description: "Failed to start recording. Please check microphone permissions.",
      //   variant: "destructive",
      // });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    try {
      // IMMEDIATE STATE CLEANUP - Fix for recording continuation bug
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // IMMEDIATE MediaRecorder stop
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        // Stop the recorder immediately
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Start processing in background
      setIsProcessing(true);
      setIsUploading(true);
      
      return new Promise<void>((resolve) => {
        if (!mediaRecorderRef.current) return resolve();

        mediaRecorderRef.current.onstop = async () => {
          try {
            console.log('Processing recording with userId:', user?.id);
            
            if (!user?.id) {
              throw new Error('User not authenticated');
            }

            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log('Audio blob created, size:', audioBlob.size);
            
            // Convert to base64 for transmission
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const base64Audio = (reader.result as string).split(',')[1];
                console.log('Audio converted to base64, length:', base64Audio.length);
                
                setIsUploading(false);
                setIsTranscribing(true);
                
                // Call transcribe function
                console.log('Calling transcribe function...');
                const { data, error } = await supabase.functions.invoke('transcribe-audio', {
                  body: { audio: base64Audio }
                });

                if (error) {
                  console.error('Transcription error:', error);
                  throw new Error(`Transcription failed: ${error.message}`);
                }

                console.log('Transcription successful:', data);

                if (data?.text) {
                  setIsTranscribing(false);
                  setIsRewriting(true);
                  
                  // Call rewrite function with GPT-4o-mini
                  console.log('Calling rewrite function...');
                  const { data: rewriteData, error: rewriteError } = await supabase.functions.invoke('rewrite-content', {
                    body: { 
                      text: data.text,
                      style: 'professional',
                      length: 'medium'
                    }
                  });

                  if (rewriteError) {
                    console.error('Rewrite error:', rewriteError);
                    throw new Error(`Rewriting failed: ${rewriteError.message}`);
                  }

                  console.log('Rewriting successful:', rewriteData);

                  setIsRewriting(false);
                  setIsSaving(true);

                  // Save to database with better error handling and folder support
                  console.log('Saving to database...');
                  const noteData = {
                    clerk_user_id: user.id,
                    title: `Recording from ${new Date().toLocaleDateString()}`,
                    original_transcript: data.text,
                    rewritten_content: rewriteData?.rewrittenText || data.text,
                    category: 'Voice Recording',
                    ...(currentFolder && { folder_id: currentFolder })
                  };
                  
                  console.log('Note data to insert:', noteData);

                  const { data: insertData, error: insertError } = await supabase
                    .from('notes')
                    .insert(noteData)
                    .select();

                  if (insertError) {
                    console.error('Database insert error:', insertError);
                    throw new Error(`Failed to save note: ${insertError.message}`);
                  }

                  console.log('Note saved successfully:', insertData);
                  setIsSaving(false);

                  // toast({
                  //   title: "Recording Saved",
                  //   description: "Your recording has been transcribed and saved successfully!",
                  // });

                  // Transform database note to frontend Note interface and call completion callback
                  if (onRecordingComplete && insertData && insertData[0]) {
                    const dbNote = insertData[0];
                    const frontendNote: Note = {
                      id: dbNote.id,
                      title: dbNote.title,
                      originalTranscript: dbNote.original_transcript,
                      rewrittenContent: dbNote.rewritten_content,
                      createdAt: dbNote.created_at || '',
                      tags: dbNote.tags || [],
                      category: dbNote.category || 'Voice Recording',
                      isPrivate: dbNote.is_private || false,
                      audioUrl: dbNote.audio_url || undefined,
                      folderId: dbNote.folder_id || undefined
                    };
                    onRecordingComplete(frontendNote);
                  }
                } else {
                  throw new Error('No transcription text received');
                }
              } catch (error) {
                console.error('Error processing recording:', error);
                // toast({
                //   title: "Processing Error",
                //   description: error instanceof Error ? error.message : "Failed to process your recording. Please try again.",
                //   variant: "destructive",
                // });
              } finally {
                setIsProcessing(false);
                setIsUploading(false);
                setIsTranscribing(false);
                setIsRewriting(false);
                setIsSaving(false);
                resolve();
              }
            };
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            console.error('Error processing recording:', error);
            // toast({
            //   title: "Processing Error",
            //   description: error instanceof Error ? error.message : "Failed to process your recording. Please try again.",
            //   variant: "destructive",
            // });
            setIsProcessing(false);
            setIsUploading(false);
            setIsTranscribing(false);
            setIsRewriting(false);
            setIsSaving(false);
            resolve();
          }
        };
      });
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      // toast({
      //   title: "Recording Error",
      //   description: "Failed to process recording. Please try again.",
      //   variant: "destructive",
      // });
      // Reset states in case of error
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setIsProcessing(false);
      setIsUploading(false);
      setIsTranscribing(false);
      setIsRewriting(false);
      setIsSaving(false);
    }
  }, [user?.id, toast, onRecordingComplete, currentFolder]);

  const cancelRecording = useCallback(() => {
    // Stop recording without processing/saving
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Clear audio chunks to prevent accidental processing
    audioChunksRef.current = [];
    
    toast({
      title: "Recording Cancelled",
      description: "Your recording has been cancelled and discarded.",
    });
  }, [toast]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  const resetRecording = useCallback(async () => {
    // Cancel current recording without saving
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Clear audio chunks
    audioChunksRef.current = [];
    
    // Restart recording immediately
    setTimeout(() => {
      startRecording();
    }, 100);
  }, [startRecording]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    isProcessing,
    isUploading,
    isTranscribing,
    isRewriting,
    isSaving,
    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resetRecording,
    setRecordingTime
  };
};
