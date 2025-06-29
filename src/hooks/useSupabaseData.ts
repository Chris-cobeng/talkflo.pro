import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';
import { Note, Folder } from '@/types';

export const useSupabaseData = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      // Convert snake_case to camelCase for frontend
      const convertedNotes: Note[] = (notesData || []).map(note => ({
        id: note.id,
        title: note.title,
        originalTranscript: note.original_transcript,
        rewrittenContent: note.rewritten_content,
        createdAt: note.created_at || '',
        tags: note.tags || [],
        category: note.category || 'All Notes',
        isPrivate: note.is_private || false,
        audioUrl: note.audio_url || undefined,
        folderId: note.folder_id || undefined
      }));

      setNotes(convertedNotes);

      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('clerk_user_id', user.id)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      const convertedFolders: Folder[] = (foldersData || []).map(folder => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.created_at || '',
        noteCount: convertedNotes.filter(note => note.folderId === folder.id).length
      }));

      setFolders(convertedFolders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = fetchData;

  const createFolder = async (name: string) => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('folders')
      .insert({
        name,
        clerk_user_id: user.id
      });

    if (error) throw error;
    await fetchData();
  };

  const deleteFolder = async (folderId: string) => {
    if (!user?.id) return;
    
    // Move notes from folder to All Notes
    await supabase
      .from('notes')
      .update({ folder_id: null })
      .eq('folder_id', folderId)
      .eq('clerk_user_id', user.id);

    // Delete folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('clerk_user_id', user.id);

    if (error) throw error;
    await fetchData();
  };

  const deleteNotes = async (noteIds: string[]) => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .in('id', noteIds)
      .eq('clerk_user_id', user.id);

    if (error) throw error;
    
    setNotes(prevNotes => prevNotes.filter(note => !noteIds.includes(note.id)));
  };

  const updateNote = async (noteId: string, updates: { rewritten_content?: string }) => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .eq('clerk_user_id', user.id);

    if (error) throw error;

    // Update the note in local state without refetching all notes
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, rewrittenContent: updates.rewritten_content ?? note.rewrittenContent }
          : note
      )
    );
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  return {
    notes,
    folders,
    loading,
    refetch,
    createFolder,
    deleteFolder,
    deleteNotes,
    updateNote
  };
};
